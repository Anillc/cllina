import { Context, Logger, Quester, segment, Channel } from 'koishi'
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

export const using = ['puppeteer']

const logger = new Logger('dynamic')
let channels: Partial<Channel>[]

let update = false
const updateSubscriptions = async (ctx: Context) =>
    channels = await ctx.database.get('channel', {}, ['id', 'platform', 'assignee', 'dynamic'])

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
        cmd.subcommand('.add <uid>')
            .channelFields(['dynamic'])
            .action(async ({ session }, uid) => {
                try {
                    if (!uid) return '请输入正确的 uid'
                    const dynamic = session.channel.dynamic.subscriptions
                    if (dynamic.filter(subscription => subscription.uid === uid).length !== 0) {
                        return '该用户已在监听列表中'
                    }
                    const cards = await request(ctx.http, uid)
                    if (!cards) throw 'cards is null'
                    dynamic.push({
                        uid,
                        time: cards[0].time
                    })
                    update = true
                    return '添加成功'
                } catch (e) {
                    logger.error(e)
                    return '添加失败'
                }
            })
        cmd.subcommand('.remove <uid>', { authority: 2 })
            .channelFields(['dynamic'])
            .action(async ({ session }, uid) => {
                if (!uid) return '请输入正确的 uid'
                const dynamic = session.channel.dynamic.subscriptions
                const user = dynamic.filter(subscription => subscription.uid === uid)
                if (user.length === 0) {
                    return '该用户已不监听列表中'
                }
                dynamic.splice(dynamic.indexOf(user[0]) + 1, 1)
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

async function dynamic(ctx: Context) {
    let i = -1
    // TODO: random-src
    async function send() {
        const subscriptions = channels.flatMap(channel =>
            channel.dynamic.subscriptions.map(subscription =>
                ({ channel, subscription })))
        if (subscriptions.length === 0) return
        i = i >= subscriptions.length - 1 ? 0 : i + 1
        const { subscription, channel } = subscriptions[i]

        const sends = (await request(ctx.http, subscription.uid))
            .filter(dynamic => dynamic.time > subscription.time)
        if (sends.length === 0) return

        const bot = ctx.bots[`${channel.platform}:${channel.assignee}`]
        subscription.time = sends[0].time
        await ctx.database.set('channel', { id: channel.id }, { dynamic: channel.dynamic })
        const promises = sends.reverse().map((async ({ dynamicId }) => {
            const renderResult = await render(ctx, dynamicId)
            await bot.sendMessage(channel.id, renderResult)
        }))
        const results = (await Promise.allSettled(promises))
            .filter(n => n.status === 'rejected')
            .map(n => (n as PromiseRejectedResult).reason)
        if (results.length !== 0) throw results
    }
    (function start() {
        setTimeout(async () => {
            try {
                if (!channels || update) {
                    await updateSubscriptions(ctx)
                    update = false
                }
                await send()
            } catch (e) {
                logger.error(e)
            }
            start()
        }, 7000)
    })()
}

async function request(quester: Quester, uid: string) {
    const res = await quester.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`, {
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

// TODO: cache
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
            let popover
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
