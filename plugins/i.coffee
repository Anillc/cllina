{ s } = require 'koishi'

module.exports = (ctx) ->
  ctx.command 'i <msg:text>', { authority: 3 }
    .action (_, msg) ->
      return s.escape msg
  ctx.channel(process.env.CHANNEL).on 'message', (session) ->
    session.send s.escape session.message
    