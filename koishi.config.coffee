path = require 'path'
require('dotenv').config()

module.exports =
  prefix: '-'
  nickname: ['cllina', 'Cllina', 'cl', 'na酱', 'na 酱', 'na']
  autoAssign: true
  autoAuthorize: 1
  bots: [
    type: 'onebot'
    selfId: process.env.QQ
    server: process.env.SERVER
    token: process.env.TOKEN
  ]
  plugins:
    'koishi-plugin-mysql':
      host: process.env.DATABASE_HOST
      user: process.env.DATABASE_USER
      password: process.env.DATABASE_PASSWD
      database: process.env.DATABASE
    'koishi-plugin-common': {}
    'koishi-plugin-teach': {}
    'koishi-plugin-eval':
      setupFiles:
        inj: path.resolve __dirname, 'inj/index.js'
    'koishi-plugin-schedule': {}
    'koishi-plugin-tools':
      bilibili: false
    'koishi-plugin-puppeteer':
      browser:
        args: ['--no-sandbox']
    # 'koishi-plugin-github':
    #   appId: 'e0af8cdb720f2ecd0ab6'
    #   appSecret: 'b7e8b3887d0074d038beefe4ae55c3e0fdfdf736'
    'koishi-plugin-gosen-choyen': {}
    './plugins/ssh': {}
    './plugins/d': {}
    './plugins/forward': {}
    './plugins/bullshit': {}