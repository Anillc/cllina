import { Context, s } from 'koishi'

export function apply(ctx: Context) {
    ctx.command('i <msg:text>', { authority: 3 })
        .action((_, msg) => s.escape(msg))
    ctx.channel(process.env.CHANNEL).on('message', (session) => {
        session.send(s.escape(session.content))
    })
}