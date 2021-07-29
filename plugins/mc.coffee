mc = require 'minecraft-protocol'
_ = require 'lodash'
{ s } = require 'koishi'

client = mc.createClient
  host: 'kano.tpmc.xyz'
  username: 'Anillc\'s bot'

msgReg = /^.*<(.+)> -qq (.+)$/g

isChat = (pack) ->
  ex = JSON.parse pack.message
    .extra
  msg = _ ex
    .map (e) -> e.text
    .join ''
  regRes = msgReg.exec msg
  if !regRes then return false
  res = {
    username: regRes[1]
    text: regRes[2]
  }
  if res.username == client.username then return false
  return res

module.exports = (ctx) ->
  client.on 'login', ->
    client.on 'chat', (msg) ->
      res = isChat msg
      if !res || res.text.startsWith '-qq ' then return
      send = "#{res.username}: #{res.text}"
      ctx.bots[0].sendMessage '386698502', send
    ctx.command 'mc <msg:text>'
      .action ({session}, msg) ->
        if !msg then return
        client.write 'chat', {
          message: "#{session.author.username}: #{msg}"
        }
    ctx.command 'respawn', { authority: 3 }
      .action ->
        client.write 'client_command', { payload: 0 }
    ctx.command 'mcecho <msg:text>', { authority: 3 }
      .action (_, msg) ->
        console.log msg
        client.write 'chat', {
          message: s.unescape msg
        } 
