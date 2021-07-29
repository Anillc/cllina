gen = require 'jsbullshit/generator'
_ = require 'lodash'

module.exports = (ctx) ->
  ctx.command 'bs <title>'
    .action ({session}, title) ->
      if !title then return '请输入正确的标题'
      if !session.channelId then return '请在群聊环境中使用'
      article = gen title
      nodes = []
      _.chunk(article, 100).forEach (e) ->
        nodes.push
          type: 'node'
          data:
            name: 'Cllina'
            uin: 3331393019
            content: e.join ''
      session.bot.$sendGroupForwardMsg session.channelId, nodes
