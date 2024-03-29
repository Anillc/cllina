import { OneBotBot } from '@koishijs/plugin-adapter-onebot'
import { Argv, Context, segment } from 'koishi'

export const name = 'trivial'

export function apply(ctx: Context) {
    ctx.platform('onebot').command('fake', { authority: 2 })
        .action(async ({ session }) => {
            if (!session.channelId) return '请在 onebot 平台的群聊条件下使用该指令'
            await session.send('请发送消息（可发送多条），格式为 qq|name|msg, 最后发送小写 ok 结束消息发送')
            const nodes = []
            while (true) {
                const input = segment.unescape(await session.prompt(60 * 1000))
                if (input === 'ok') break
                if (!input) return '操作超时'
                const res = /^(\d+)\|([^\|]+)\|(.+)$/g.exec(input)
                if(!res) {
                    await session.send('输入错误，请重试')
                    continue
                }
                nodes.push({
                    type: 'node',
                    data: {
                        uin: res[1],
                        name: res[2],
                        content: res[3],
                    },
                })
            }
            if (nodes.length === 0) return '请至少发送一条正确的消息'
            return (session.bot as unknown as OneBotBot).internal.sendGroupForwardMsgAsync(session.channelId, nodes)
        })
    const evaluate = ctx.command('evaluate [expr:rawtext]')
    ctx.command('!')
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