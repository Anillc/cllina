{ s } = require 'koishi'

module.exports = (ctx) ->
  ctx.command 'fake', { authority: 2 }
    .action ({session}) ->
      if !session.channelId then return '请在群中使用该指令'
      await session.send '请发送消息（可发送多条），格式为 qq|name|msg，最后发送小写 ok 结束消息发送'
      cqnodes = []
      while true
        input = s.unescape await session.prompt 60000
        if input == 'ok' then break
        if input == '' then return '操作超时'
        res = /^(\d+)\|([^\|]+)\|(.+)$/g.exec input
        if !res
          session.send '输入错误，请重新输入'
          continue
        cqnodes.push
          type: 'node'
          data:
            name: res[2]
            uin: res[1]
            content: res[3]
      if cqnodes.length == 0 then return '请至少发送一条正确的消息'
      session.bot.$sendGroupForwardMsg session.channelId, cqnodes
