_ = require 'lodash'
{ Client } = require 'ssh2'
{ strip } = require 'ansicolor'
{ s, Command } = require 'koishi'

config =
  host: '127.0.0.1'
  port: 2222
  username: 'root'
  password: 'root'

sleep = (time) -> new Promise (rev) -> setTimeout rev, time

getStream = (config) -> new Promise (rev, rej) ->
  conn = new Client
  conn.on 'ready', -> conn.shell (err, stream) ->
    rej err if err
    rev stream
  conn.on 'error', rej
  conn.connect config

users = {}

start = (session, cfg = config) ->
  stream = users[session.user.id]
  return stream if stream
  stream = await getStream cfg
  users[session.user.id] = stream
  msg = ''
  i = setInterval (->
    msgCopy = msg.trim()
    msg = ''
    nums = _.countBy msgCopy.split ''
    r = nums['\r'] or 0
    n = nums['\n'] or 0
    if r + n == 0 then return
    if r + n <= 8
      session.send msgCopy
    else
      preMsg = "<p><pre>#{msgCopy}</pre></p>"
      session.send await session.app.puppeteer.render preMsg
  ), 2000
  stream.on 'data', (data) ->
    msg += (strip data.toString()).trim() + '\n'
  stream.once 'close', ->
    users[session.user.id] = undefined
    clearInterval i
    session.send '连接已关闭'
  return stream

module.exports = (ctx) ->
  Command.userFields ['id']
  cmd = ctx.command '- <cmd:text>', { authority: 3 }
  cmd.alias '='
    .action ({session}, cmd) ->
      stream = await start session
      if !cmd then cmd = ''
      stream.stdin.write s.unescape (cmd + '\n').replace /\r/g, ''

  cmd.subcommand '.type <cmd:text>', { authority: 3 }
    .alias '=='
    .alias '--'
    .action ({session}, cmd) ->
      stream = await start session
      if !cmd then cmd = ''
      stream.stdin.write s.unescape cmd.replace /\r/g, ''

  cmd.subcommand '.connect <url> [password]', { authority: 3 }
    .option 'port', '-p <port>'
    .action ({options, session}, url, password = '') ->
      return "请先断开连接" if users[session.user.id]
      try
        if !url
          await start session
          return
        { port = 22 } = options
        cfg = {
          host: (url.split '@')[1]
          port
          username: (url.split '@')[0]
          password
        }
        await start session, cfg
      catch e
        return e.toString()
      
  cmd.subcommand '.disconnect', { authority: 3 }
    .action ({session}) ->
      stream = await start session
      try
        await stream.close()
      catch e
        return e
      finally
        users[session.user.id] = undefined

  cmd.subcommand '.c', { authority: 3 }
    .action ({session}) ->
      stream = await start session
      stream.stdin.write String.fromCharCode 3
