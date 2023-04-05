import { Context } from 'koishi'

export const name = 'do'

export function apply(ctx: Context) {
    ctx.middleware(async (session, next) => {
        if (!session.quote) {
            return next()
        }
        const elements = [...session.elements]
        while (elements[0]?.type === 'at') {
            elements.shift()
        }
        if (elements.length === 0) return next()
        if (elements.find(element => element.type !== 'text')) return next()
        const content = elements.join('')
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