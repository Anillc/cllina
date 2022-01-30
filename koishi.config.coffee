path = require 'path'
require('dotenv').config()

{ env } = process

module.exports =
  logger:
    root: 'logs'
  prefix: '-'
  exitCommand: true
  port: 8056
  host: '0.0.0.0'
  plugins:
    'adapter-onebot':
      selfId: env.QQ
      endpoint: env.SERVER
    'adapter-discord':
      token: env.DISCORD_TOKEN
    #'adapter-telegram':
    #  selfUrl: env.TELEGRAM_SELFURL
    #  token: env.TELEGRAM_TOKEN
    'database-mysql':
      database: env.DATABASE
      host: env.DATABASE_HOST
      user: env.DATABASE_USER
      password: env.DATABASE_PASSWORD
      socketPath: env.DATABASE_SOCKET_PATH
    teach: {}
    admin: {}
    bind: {}
    echo: {}
    recall: {}
    repeater: {}
    sudo: {}
    switch: {}
    schedule: {}
    feedback: [
      env.FEEDBACK
    ]
    verifier:
      onFriendRequest: 1
      onGuildMemberRequest: 2
      onGuildRequest: 3
    tools:
      bilibili: false
      wolframAlphaAppId: env.WOLFRAMALPHA_APPID
      glot:
        apiToken: env.GLOT_TOKEN
        defaultLanguage: 'haskell'
      youdaoAppKey: env.YOUDAO_KEY
      youdaoSecret: env.YOUDAO_SECRET
    puppeteer:
      browser:
        args: ['--no-sandbox']
    eval:
      setupFiles:
        inj: path.resolve __dirname, 'inj/index.js'
      scriptLoader: 'coffeescript'
      timeout: 30000
    influxdb:
      url: env.INFLUXDB_URL
      token: env.INFLUXDB_TOKEN
      org: 'AnillcNetwork'
      bucket: 'bot'
    forward: {}
    'influxdb-collect': {}
    './src/d': {}
    './src/i': {}
    './src/forward': {}
    './src/do': {}