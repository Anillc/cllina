import { Context } from 'koishi'

export function apply(ctx: Context) {
    ctx.command('regex <regex:string> <text:rawtext>')
        .alias('re')
        .option('global', '-g global')
        .option('ignore-case', '-i ignore case')
        .option('multiline', '-m multiline')
        .option('stringify', '-s stringify')
        .action(({ options }, regex, text) => {
            try {
                let flags = ''
                if (options['global']) flags += 'g'
                if (options['ignore-case']) flags += 'i'
                if (options['multiline']) flags += 'm'
                const match = new RegExp(`(${regex})`, flags).exec(text)
                if (options.stringify) {
                    return JSON.stringify(match, null, 2)
                } else {
                    return match?.[2] || match?.[1] || '未匹配到结果'
                }
            } catch (e) {
                return String(e)
            }
        })
    ctx.command('replace <regex:string> <replacer:string> <text:rawtext>')
        .alias('sed')
        .option('global', '-g global')
        .option('ignore-case', '-i ignore case')
        .option('multiline', '-m multiline')
        .action(({ options }, regex, replacer, text) => {
            try {
                let flags = ''
                if (options['global']) flags += 'g'
                if (options['ignore-case']) flags += 'i'
                if (options['multiline']) flags += 'm'
                return text.replace(new RegExp(regex, flags), replacer)
            } catch (e) {
                return String(e)
            }
        })
}