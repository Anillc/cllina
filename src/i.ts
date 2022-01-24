import { Context, s } from 'koishi'

export function apply(ctx: Context) {
    let enable = false
    ctx.command('i <msg:text>', { authority: 3 })
        .option('enable', '-e')
        .action(({ options }, msg) => {
            if (options.enable) {
                enable = !enable
                console.log('status: ', enable)
                return
            }
            return s.escape(msg)
        })
    ctx.channel(process.env.CHANNEL).on('message', (session) => {
        if (enable) {
            session.send(s.escape(session.content))
        }
    })
}