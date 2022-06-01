import { Argv, Context, segment } from 'koishi'

export function apply(ctx: Context) {
    const evaluate = ctx.command('evaluate [expr:rawtext]')
    ctx.command('>')
        .action(({ session }) => {
            const { content } = session.parsed
            const expr = segment.unescape(content.slice(2))
            const argv: Argv = {
                command: evaluate,
                args: [expr],
            }
            return session.execute(argv)
        })
}
