import { Context } from 'koishi'
import { dice } from '@onedice/core'

export const name = 'onedice'

export function apply(ctx: Context) {
    // this doesn't handle all conditions
    const prefix = ctx.options.prefix as string
    ctx.middleware((session, next) => {
        const regex = new RegExp(`^${prefix}r(.*)$`)
        const result = regex.exec(session.content)
        if (!result) return next()
        const expression = result[1]
        return session.execute(`roll ${expression}`)
    })
    // rawtext for onedice v2 []
    ctx.command('roll <expression:rawtext>')
        .alias('r')
        .action(({ session }, expression) => {
            try {
                const name = session.author.username
                const [value, root] = dice(expression)
                const details = root.toString()
                if (details.length > 500) {
                    return `${name} 投掷 ${expression} = ${value}`
                } else {
                    return `${name} 投掷\n${details} = ${value}`
                }
            } catch (e) {
                if (e instanceof Error) {
                    return e.message
                } else {
                    return String(e)
                }
            }
        })
}