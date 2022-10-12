import { Context, segment } from 'koishi'

export const name = 'do'

export function apply(ctx: Context) {
    ctx.middleware(async (session, next) => {
        if (!session.quote) {
            return next()
        }
        let content = session.parsed.content
        const segs = segment.parse(content)
        if (segs?.[0].type === 'at') {
            segs.shift()
            content = segs.join().trim()
        }
        const res1 = /^\/([^ ]+)$/.exec(content)
        const res2 = /^\/([^ ]+) ([^ ]+)$/.exec(content)
        if (!res1 && !res2) return next()
        const replyToUsername = session.quote.author.username
        const replyUsername = session.author.username
        if(res1) {
            session.send(`${replyUsername} ${res1[1]} 了 ${replyToUsername}`)
        } else {
            session.send(`${replyUsername} ${res2[1]} 了 ${replyToUsername} 的 ${res2[2]}`)
        }
    })
}