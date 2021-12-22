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
      translate:
        youdaoAppKey: env.YOUDAO_KEY
        youdaoSecret: env.YOUDAO_SECRET
    puppeteer:
      browser:
        args: ['--no-sandbox']
    eval:
      setupFiles:
        inj: path.resolve __dirname, 'inj/index.js'
      scriptLoader: 'coffeescript'
    './src/d': {}
    './src/i': {}
    './src/forward': {}