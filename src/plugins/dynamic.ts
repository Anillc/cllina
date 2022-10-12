import { Context, Logger, Quester, segment, Channel, User, Command } from 'koishi'
import { Page } from 'puppeteer-core'
import {} from 'koishi-plugin-puppeteer'
import HttpsProxyProxy from 'https-proxy-agent'
// TODO: remove after upgrading of axios of koishi
import axios from 'axios'

declare module 'koishi' {
    interface Channel {
        dynamic?: { subscriptions: Subscription[] }
    }
}

interface Subscription {
    uid: string
    time: number
}

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
                        [uid, await requestRetry(uid)] as const))
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
        const cache = new Map<string, segment>
        const subs = channels.flatMap(channel =>
            channel.dynamic.subscriptions.map(sub =>
                ({ channel, sub })))

        // get the dynamics that needs to be sent
        const dynamics: [
            typeof subs[number],
            { dynamicId: string, time: number }[],
        ][] = []
        for (const sub of subs) {
            try {
                dynamics.push([sub, await requestRetry(sub.sub.uid)])
            } catch (e) {
                ctx.notify(e)
            }
        }
        
        // render and send
        for (const [{ sub, channel }, dynamic] of dynamics) {
            const bot = ctx.bots[`${channel.platform}:${channel.assignee}`]
            const sends = dynamic.filter(dynamic => dynamic.time > sub.time)
            if (sends.length === 0) continue

            sub.time = sends[0].time
            await ctx.database.set('channel', { id: channel.id }, { dynamic: channel.dynamic })

            for (const { dynamicId } of sends.reverse()) {
                let renderResult = cache.get(dynamicId)
                if (!renderResult) {
                    renderResult = await renderRetry(ctx, dynamicId)
                    cache.set(dynamicId, renderResult)
                }
                bot.sendMessage(channel.id, renderResult, channel.guildId)
            }
        }
    }
    (function watch() {
        setTimeout(async () => {
            try {
                if (!channels || update) {
                    update = false
                    await updateSubscriptions(ctx)
                }
            } catch (e) {
                update = true
            }
            try {
                await send()
            } catch(e) {
                ctx.notify(e)
                logger.error(e)
            }
            watch()
        }, 60 * 1000)
    })()
}

async function requestRetry(uid: string, times = 3): Promise<{
    dynamicId: string,
    time: number
}[]> {
    try {
        return await request(uid)
    } catch(e) {
        logger.error(e)
        if (times - 1 <= 0) throw e
        return await requestRetry(uid, times - 1)
    }
}

async function request(uid: string) {
    const req = axios.get('https://[240e:f7:e01f:f1::30]/x/polymer/web-dynamic/v1/feed/space?host_mid=' + uid, {
        headers: {
            'Host': 'api.bilibili.com',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'Referer': `https://space.bilibili.com/${uid}/dynamic`,
        },
        httpsAgent: HttpsProxyProxy({
            host: 'rsrc.a',
            port: '1080',
            requestCert: true,
        }),
    })
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    const res = (await req).data
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
    if (res.code !== 0) throw new Error(`Failed to get dynamics. ${res}`)
    return (res.data.items as any[]).map(item => ({
        dynamicId: item.id_str,
        time: item.modules.module_author.pub_ts as number
    }))
}

async function renderRetry(ctx: Context, dynamicId: string, times: number = 7): Promise<segment> {
    try {
        return await render(ctx, dynamicId)
    } catch(e) {
        logger.error(e)
        if (times - 1 <= 0) throw e
        return await renderRetry(ctx, dynamicId, times - 1)
    }
}

async function render(ctx: Context, dynamicId: string) {
    let page: Page
    try {
        page = await ctx.puppeteer.page()
        await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })
        await page.goto(`https://t.bilibili.com/${dynamicId}`)
        await page.waitForNetworkIdle()
        await (await page.$('.login-tip'))?.evaluate(e => e.remove())
        await (await page.$('.bili-dyn-item__panel')).evaluate(e => e.remove())
        await page.evaluate(() => {
            let popover: any
            while (popover = document.querySelector('.van-popover')) popover.remove()
        })
        const element = await page.$('.bili-dyn-item')
        const shot = await element.screenshot({ encoding: 'binary' })
        return segment.image(shot)
    } catch (e) {
        throw e
    } finally {
        page?.close()
    }
}
