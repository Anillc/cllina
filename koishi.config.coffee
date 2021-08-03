path = require 'path'
require('dotenv').config()

module.exports =
  prefix: '-'
  nickname: ['cllina', 'Cllina', 'cl', 'na酱', 'na 酱', 'na']
  autoAssign: true
  autoAuthorize: 1
  deamon:
    exitCommand: true
  bots: [
    type: 'onebot'
    selfId: process.env.QQ
    server: process.env.SERVER
    token: process.env.TOKEN
  ]
  plugins:
    'mysql':
      host: process.env.DATABASE_HOST
      user: process.env.DATABASE_USER
      password: process.env.DATABASE_PASSWD
      database: process.env.DATABASE
    'common': {}
    'teach': {}
    'eval':
      setupFiles:
        inj: path.resolve __dirname, 'inj/index.js'
      scriptLoader: 'coffeescript'
    'schedule': {}
    'tools':
      bilibili: false
    'puppeteer':
      browser:
        args: ['--no-sandbox']
    # 'koishi-plugin-github':
    #   appId: 'e0af8cdb720f2ecd0ab6'
    #   appSecret: 'b7e8b3887d0074d038beefe4ae55c3e0fdfdf736'
    'gosen-choyen': {}
    'genshin':
      cookie: process.env.GENSHIN_COOKIE
      wish:
        enable: true
    './plugins/ssh': {}
    './plugins/d': {}
    './plugins/forward': {}
    './plugins/bullshit': {}
    './plugins/updater': {}
    './plugins/i': {}