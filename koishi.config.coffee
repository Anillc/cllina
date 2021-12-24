path = require 'path'
require('dotenv').config()

{ env } = process

module.exports =
  logger:
    root: 'logs'
  prefix: '-'
  autoAssign: 1
  autoAuthorize: 1
  exitCommand: true
  plugins:
    'adapter-onebot':
      selfId: env.QQ
      endpoint: env.SERVER
    'database-mysql':
      database: env.DATABASE
      user: env.DATABASE_USER
      socketPath: env.DATABASE_SOCKET_PATH
    teach: {}
    common: {}
    schedule: {}
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
    influxdb:
      url: env.INFLUXDB_URL
      token: env.INFLUXDB_TOKEN
      org: 'AnillcNetwork'
      bucket: 'bot'
    'influxdb-collect': {}
    './src/d': {}
    './src/i': {}
    './src/forward': {}