import { Context, Schema } from 'koishi'

declare module 'koishi' {
    interface Context {
        notify(message: any): Promise<string[][]>
    }
    interface Channel {
        notify: boolean
    }
}

Context.service('notify')

export const name = 'notify'

export function apply(ctx: Context) {
    ctx.model.extend('channel', {
        notify: {
            type: 'boolean',
            initial: false,
        },
    })
    ctx.using(['database'], ctx => {
        ctx.notify = async (message) => {
            if (message instanceof Error) {
                message = `发生错误: \n${message.name} ${message.message}\n调用栈:\n${message.stack}`.trim()
            }
            const channels = await ctx.database.get('channel', { notify: {
                $eq: true
            } })
            if (channels.length === 0) return []
            return await Promise.all(channels.map(channel => {
                const bot = ctx.bots[`${channel.platform}:${channel.assignee}`]
                return bot.sendMessage(channel.id, String(message), channel.guildId)
            }))
        }
        ctx.channel().command('notify [message:text]', { authority: 4, checkArgCount: false })
            .option('query', '-q')
            .channelFields(['notify'])
            .action(({ session, options }, message) => {
                if (message) {
                    ctx.notify(message)
                    return
                }
                if (options.query) return '当前状态为: ' + session.channel.notify
                session.channel.notify = !session.channel.notify
                return '修改成功，当前状态为: ' + session.channel.notify
            })
    })
}