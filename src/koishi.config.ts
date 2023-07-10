import { resolve } from 'path'
import { HttpsProxyAgent } from 'https-proxy-agent'

const secrets = require(process.env.SECRETS)
const pwd = process.env.PWD

function local(plugins: Record<string, any>) {
  return Object.fromEntries(Object.entries(plugins).map(([name, config]) => ([
    resolve(__dirname, `./plugins/${name}`),
    config,
  ])))
}

export default {
  nickname: 'cllina',
  prefix: secrets.prefix,
  exitCommand: true,
  port: 8056,
  host: '0.0.0.0',
  selfUrl: secrets.selfUrl,
  plugins: {
    '@chronocat/adapter': {
      endpoint: secrets.chronocat.endpoint,
      token: secrets.chronocat.token,
    },
    'adapter-discord': {
      token: secrets.discord.token,
    },
    'adapter-telegram': {
      protocol: 'polling',
      token: secrets.telegram.token,
    },
    'database-mysql': {
      database: secrets.database.name,
      host: secrets.database.host,
      user: secrets.database.user,
      password: secrets.database.password,
      socketPath: secrets.database.socket,
    },
    'console': {},
    'help': {},
    'admin': {},
    'bind': {},
    'chess': {},
    'echo': {},
    'forward': {},
    'influxdb-collect': {},
    'music': {},
    'qrcode': {},
    'recall': {},
    'schedule': {},
    'sudo': {},
    'dialogue': {},
    'dialogue-author': {},
    'dialogue-context': {},
    'dialogue-flow': {},
    'dialogue-rate-limit': {},
    'dialogue-time': {},
    'tex': {},
    'screenshot': {},
    // messages 有个 maxAge 选项，但是代码里没有用
    // 下次更新的时候再检查一下
    'messages': {},
    'rr-image-censor': {},
    'rryth': {
      censor: true,
      output: 'minimal',
    },
    'bilibili': {
      useragent: 'Mozilla/5.0',
      dynamic: {
        enable: true,
        httpsAgent: new HttpsProxyAgent('http://rsrc.a:1080'),
      },
    },
    'puppeteer': {
      args: ['--no-sandbox', '--ignore-certificate-errors'],
    },
    'assets-local': {
      root: resolve(pwd, '.koishi/assets')
    },
    'eval': {
      root: resolve(pwd, '.koishi/eval'),
      storageFile: 'storage',
      cacheFile: 'cache',
      dataKeys: ['storageFile', 'cacheFile', 'inspect', 'moduleLoaders', 'setupFiles', 'loaderConfig', 'serializer'],
      scriptLoader: 'coffeescript',
      setupFiles: {
        'inj': resolve(__dirname, './inj/index.js'),
      },
      timeout: 3000
    },
    'glot': {
      apiToken: secrets.glot.token,
      defaultLanguage: 'haskell',
    },
    'influxdb': {
      bucket: 'bot',
      org: 'AnillcNetwork',
      token: secrets.influxdb.token,
      url: secrets.influxdb.url,
    },
    'verifier': {
      onFriendRequest: 1,
      onGuildMemberRequest: 2,
      onGuildRequest: 3,
    },
    'wolfram-alpha': {
      appid: secrets.wolframalpha.appid,
    },
    'translator-youdao': {
      appKey: secrets.youdao.key,
      secret: secrets.youdao.secret,
    },
    'github': {
      appId: secrets.github.appId,
      appSecret: secrets.github.appSecret,
    },
    ...local({
      'api': {},
      'do': {},
      'regex': {},
      'trivial': {},
    }),
  },
}
