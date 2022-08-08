import { Context, Schema } from 'koishi'

declare module 'koishi' {
    interface Context {
        notify(message: string): Promise<string[][]>
        notifyError(error: unknown): Promise<string[][]>
    }
    interface Channel {
        notify: boolean
    }
}

Context.service('notify')
Context.service('notifyError')

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
            const channels = await ctx.database.get('channel', { notify: {
                $eq: true
            } })
            if (channels.length === 0) return []
            return await Promise.all(channels.map(channel => {
                const bot = ctx.bots[`${channel.platform}:${channel.assignee}`]
                return bot.sendMessage(channel.id, message, channel.guildId)
            }))
        }
        ctx.notifyError = async (error) => {
            if (error instanceof Error) {
                return ctx.notify(`发生错误: \n${error.name} ${error.message}\n调用栈:\n${error.stack}`.trim())
            } else {
                return ctx.notify(`发生错误: \n${String(error)}`.trim())
            }
        }
        ctx.channel().command('notify', { authority: 4 })
            .option('query', '-q')
            .channelFields(['notify'])
            .action(({ session, options }) => {
                if (options.query) return '当前状态为: ' + session.channel.notify
                session.channel.notify = !session.channel.notify
                return '修改成功，当前状态为: ' + session.channel.notify
            })
    })
}