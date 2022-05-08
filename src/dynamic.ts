import { Context, Logger, Quester, segment } from 'koishi'
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
let subscriptions: {
    id: string
    platform: string
    assignee: string
    users?: Subscription[]
}[]

const updateSubscriptions = async (ctx: Context) => {
    const channels = await ctx.database.get('channel', {}, ['id', 'platform', 'assignee', 'dynamic'])
    subscriptions = channels.map(channel => ({
        id: channel.id,
        platform: channel.platform,
        assignee: channel.assignee,
        users: channel.dynamic.subscriptions
    }))
}

export function apply(ctx: Context) {
    ctx.model.extend('channel', {
        dynamic: 'json'
    })
    ctx.using(['database'], dynamic)
    ctx.using(['database'], ctx => {
        const cmd = ctx.command('dynamic', { authority: 2 })
        cmd.subcommand('.add <uid>')
            .channelFields(['dynamic'])
            .action(async ({ session }, uid) => {
                try {
                    if (!uid) return '请输入正确的 uid'
                    const dynamic = session.channel.dynamic.subscriptions ||= []
                    if (dynamic.filter(subscription => subscription.uid === uid).length !== 0) {
                        return '该用户已在监听列表中'
                    }
                    const cards = await request(ctx.http, uid)
                    if (!cards) throw 'cards is null'
                    dynamic.push({
                        uid,
                        time: cards[0].time
                    })
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
                const dynamic = session.channel.dynamic.subscriptions ||= []
                const user = dynamic.filter(subscription => subscription.uid === uid)
                if (user.length === 0) {
                    return '该用户已不监听列表中'
                }
                dynamic.splice(dynamic.indexOf(user[0]), 1)
                return '删除成功'
            })
        cmd.subcommand('.list')
            .channelFields(['dynamic'])
            .action(({ session }) => {
                return session.channel.dynamic.subscriptions?.map(e => '·' + e.uid).join('\n') || '监听列表为空'
            })
    })
}

async function dynamic(ctx: Context) {
    let i = 0
    // TODO: random-src
    setInterval(async () => {
        await updateSubscriptions(ctx)
        const users = subscriptions
            .filter(e => e.users)
            .map(e => e.users.map(subscription => ({ channel: e, subscription }))).flat()
        if (users.length === 0) return
        i = i >= users.length ? 0 : i
        const user = users[i]
        const res = await request(ctx.http, user.subscription.uid)
        i++
        if (!res) return

        const sends = res.filter(e => e.time > user.subscription.time)
        if (sends.length === 0) return
        const bot = ctx.bots.get(`${user.channel.platform}:${user.channel.assignee}`)
        user.subscription.time = sends[0].time
        ctx.database.set('channel', { id: user.channel.id }, {
            dynamic: {
                subscriptions: user.channel.users
            }
        })
        sends.reverse().forEach(async ({ dynamicId, time }) => {
            try {
                const renderResult = await render(ctx, dynamicId)
                if (!renderResult) return
                await bot.sendMessage(user.channel.id, renderResult)
                // TODO: save time
            } catch (e) {
                logger.error(e)
            }
        })
    }, 7000)
}

async function request(quester: Quester, uid: string) {
    try {
        const res = await quester.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
                'Referer': `https://space.bilibili.com/${uid}/`,
            },
            transformResponse: data => JSONBig.parse(data)
        })
        if (res.code !== 0) return false
        return (res.data.cards as any[]).map(card => ({
            dynamicId: String(card.desc.dynamic_id),
            time: card.desc.timestamp as number
        }))
    } catch (e) {
        logger.error(e)
        return null
    }
}

// TODO: cache
async function render(ctx: Context, dynamicId: string) {
    let page: typeof Context.prototype.puppeteer.page extends () => Promise<infer T> ? T : never
    try {
        page = await ctx.puppeteer.page()
        await page.setViewport({ width: 1920, height: 1080 })
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
        logger.error(e)
        return null
    } finally {
        page?.close()
    }
}
