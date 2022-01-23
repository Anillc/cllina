import { Context, segment } from 'koishi'

export const name = 'do'

export function apply(ctx: Context) {
    ctx.middleware(async (session, next) => {
        const quote = segment.parse(session.content)?.[0]
        if (session.platform !== 'onebot' || quote?.type !== 'quote') {
            return next()
        }
        const res1 = /\/([^ ]+)$/.exec(session.parsed.content)
        const res2 = /\/([^ ]+) ([^ ]+)$/.exec(session.parsed.content)
        if (!res1 && !res2) return next()
        const replyToUsername = (await session.bot.getMessage(session.channelId, quote.data.id)).author.username
        const replyUsername = session.author.username
        if(res1) {
            session.send(`${replyUsername} ${res1[1]} 了 ${replyToUsername}`)
        } else {
            session.send(`${replyUsername} ${res2[1]} 了 ${replyToUsername} 的 ${res2[2]}`)
        }
    })
}