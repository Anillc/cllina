import { Context, Schema } from 'koishi'

declare module 'koishi' {
    interface Context {
        notify(message: string): Promise<string[][]>
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
            const channels = await ctx.database.get('channel', { notify: {
                $eq: true
            } })
            if (channels.length === 0) return []
            return await Promise.all(channels.map(channel => {
                const bot = ctx.bots[`${channel.platform}:${channel.assignee}`]
                return bot.sendMessage(channel.id, message, channel.guildId)
            }))
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