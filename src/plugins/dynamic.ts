import { Context, Logger, Quester, segment, Channel, User, Command } from 'koishi'
import {} from 'koishi-plugin-puppeteer'
import JSONBig from 'json-bigint'

declare module 'koishi' {
    interface Channel {
        dynamic?: { subscriptions: Subscription[] }
    }
}

interface Subscription {
    uid: string
    time: number
}

const reverseEndpoint = 'http://10.11.1.5/dynamic_svr/v1/dynamic_svr/space_history?host_uid='
const bilibiliEndpoint = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid='

const logger = new Logger('dynamic')
let channels: Partial<Channel>[]

let update = false
const updateSubscriptions = async (ctx: Context) =>
    channels = await ctx.database.get('channel', {}, ['id', 'guildId','platform', 'assignee', 'dynamic'])

function useLock<U extends User.Field, G extends Channel.Field, A extends any[], O extends {}>(
    command: Command<U, G, A, O>
) {
    const promises = new Set<Promise<unknown>>()
    return command.action(async (argv, ...args) => {
        await Promise.all(promises)
        let resolve: Function
        const promise = new Promise(res => resolve = res)
        promises.add(promise)
        try {
            return await argv.next()
        } finally {
            promises.delete(promise)
            resolve()
        }
    }, true)
}

export const name = 'dynamic'

export const using = ['puppeteer', 'notify']

export function apply(ctx: Context) {
    ctx.model.extend('channel', {
        dynamic: {
            type: 'json',
            initial: { subscriptions: [] },
        }
    })
    ctx.using(['database'], dynamic)
    ctx.using(['database'], ctx => {
        const cmd = ctx.command('dynamic', { authority: 2 })
        cmd.subcommand('.add <...uid:string>')
            .channelFields(['dynamic'])
            .use(useLock)
            .action(async ({ session }, ...uids) => {
                try {
                    const subs = session.channel.dynamic.subscriptions
                    const subUids = subs.map(sub => sub.uid)
                    const add = uids.filter(uid => !subUids.includes(uid))
                    const cards = await Promise.allSettled(add.map(async uid =>
                        [uid, await requestRetry(ctx.http, uid)] as const))
                    const added = []
                    for (const card of cards) {
                        if (card.status === 'rejected') continue
                        const [uid, [{ time }]] = card.value
                        subs.push({ uid, time })
                        added.push(uid)
                    }
                    update = true
                    return added.length === 0
                        ? '未添加监听'
                        : '已添加: ' + added.join(', ')
                } catch (e) {
                    logger.error(e)
                    return '添加失败'
                }
            })
        cmd.subcommand('.remove <uid:string>', { authority: 2 })
            .channelFields(['dynamic'])
            .action(({ session }, uid) => {
                if (!uid) return '请输入正确的 uid'
                const { dynamic } = session.channel
                const subs = dynamic.subscriptions.filter(sub => sub.uid !== uid)
                if (subs.length === dynamic.subscriptions.length) {
                    return '该用户不在监听列表中'
                }
                dynamic.subscriptions = subs
                update = true
                return '删除成功'
            })
        cmd.subcommand('.list')
            .channelFields(['dynamic'])
            .action(({ session }) => {
                return session.channel.dynamic.subscriptions.map(e => '·' + e.uid).join('\n') || '监听列表为空'
            })
    })
}

function dynamic(ctx: Context) {
    async function send() {
        const cache = new Map<string, string>
        const subs = channels.flatMap(channel =>
            channel.dynamic.subscriptions.map(sub =>
                ({ channel, sub })))

        // get the dynamics that needs to be sent
        const dynamics = await Promise.allSettled(
            subs.map(async sub =>
                [sub, await requestRetry(ctx.http, sub.sub.uid)] as const))
        
        // render and send
        await Promise.all(dynamics.map(async result => {
            if (result.status === 'rejected') return
            const [{ sub, channel }, dynamics] = result.value
            const bot = ctx.bots[`${channel.platform}:${channel.assignee}`]
            const sends = dynamics.filter(dynamic => dynamic.time > sub.time)
            if (sends.length === 0) return

            sub.time = sends[0].time
            await ctx.database.set('channel', { id: channel.id }, { dynamic: channel.dynamic })

            const promises = sends.reverse().map((async ({ dynamicId }) => {
                let renderResult = cache.get(dynamicId)
                if (!renderResult) {
                    renderResult = await renderRetry(ctx, dynamicId)
                    cache.set(dynamicId, renderResult)
                }
                await bot.sendMessage(channel.id, renderResult, channel.guildId)
            }))
            await Promise.all(promises)
        }))
    }
    (function watch() {
        setTimeout(async () => {
            try {
                if (!channels || update) {
                    await updateSubscriptions(ctx)
                    update = false
                }
                await send()
            } catch(e) {
                ctx.notify(e)
                logger.error(e)
            }
            watch()
        }, 7000)
    })()
}

async function requestRetry(quester: Quester, uid: string, times = 3): Promise<{
    dynamicId: string,
    time: number
}[]> {
    if (times <= 0) throw new Error('failed to request bilibili api')
    try {
        return await request(quester, uid, reverseEndpoint)
            .catch(() => request(quester, uid, bilibiliEndpoint))
    } catch(e) {
        logger.error(e)
        return await requestRetry(quester, uid, times - 1)
    }
}

async function request(quester: Quester, uid: string, endpoint: string) {
    const res = await quester.get(endpoint + uid, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'Referer': `https://space.bilibili.com/${uid}/`,
        },
        transformResponse: data => JSONBig.parse(data)
    })
    if (res.code !== 0) throw new Error(`Failed to get dynamics. ${res}`)
    return (res.data.cards as any[]).map(card => ({
        dynamicId: String(card.desc.dynamic_id),
        time: card.desc.timestamp as number
    }))
}

async function renderRetry(ctx: Context, dynamicId: string, times: number = 3): Promise<string> {
    if (times <= 0) throw new Error('failed to render dynamic')
    try {
        return await render(ctx, dynamicId)
    } catch(e) {
        logger.error(e)
        return await renderRetry(ctx, dynamicId, times - 1)
    }
}

async function render(ctx: Context, dynamicId: string) {
    let page: typeof Context.prototype.puppeteer.page extends () => Promise<infer T> ? T : never
    try {
        page = await ctx.puppeteer.page()
        await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })
        await page.goto(`https://t.bilibili.com/${dynamicId}`)
        await page.waitForNetworkIdle()
        await (await page.$('.panel-area')).evaluate(e => e?.remove())
        const element = await page.$('.card')
        await page.evaluate(() => {
            let popover: any
            while (popover = document.querySelector('.van-popover')) popover.remove()
        })
        const shot = await element.screenshot({ encoding: 'binary' })
        return segment.image(shot)
    } catch (e) {
        throw e
    } finally {
        page?.close()
    }
}
