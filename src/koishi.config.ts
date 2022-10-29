import { resolve } from 'path'

const secrets = require(process.env.SECRETS)
const pwd = process.env.PWD

function localPlugin(path: string) {
  return resolve(__dirname, path)
}

export default {
  prefix: secrets.prefix,
  exitCommand: true,
  port: 8056,
  host: '0.0.0.0',
  selfUrl: secrets.selfUrl,
  plugins: {
    'adapter-discord': {
      token: secrets.discord.token,
    },
    'adapter-onebot': {
      protocol: 'ws',
      endpoint: secrets.onebot.server,
      selfId: secrets.onebot.id,
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
    'help': {},
    'admin': {},
    'bind': {},
    'brainfuck': {},
    'chess': {},
    'echo': {},
    'forward': {},
    'influxdb-collect': {},
    'mcping': {},
    'music': {},
    'qrcode': {},
    'recall': {},
    'schedule': {},
    'sudo': {},
    'switch': {},
    'dialogue': {},
    'dialogue-author': {},
    'dialogue-context': {},
    // 'dialogue-flow': {},
    'dialogue-rate-limit': {},
    'dialogue-time': {},
    'tex': {},
    'pics': {},
    'picsource-lolicon': {
      isDefault: true,
      name: 'lolicon',
      r18: 0,
    },
    'picsource-miraikoi': {
      name: 'miraikoi',
    },
    'picsource-yande:konachan': {
      endpoint: 'https://konachan.com/post.json',
      name: 'konachan',
    },
    'picsource-yande:yande': {
      name: 'yande',
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
    'feedback': [secrets.feedback],
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
    'meme': {
      imgDir: resolve(pwd, '.koishi/memes'),
    },
    'verifier': {
      onFriendRequest: 1,
      onGuildMemberRequest: 2,
      onGuildRequest: 3,
    },
    'wolfram-alpha': {
      appid: secrets.wolframalpha.appid,
    },
    'youdao': {
      appKey: secrets.youdao.key,
      secret: secrets.youdao.secret,
    },
    'shorturl': {
      selfUrl: secrets.shorturl.url,
    },
    'novelai': {
      type: 'token',
      token: secrets.novelai.token,
      model: 'nai',
      allowAnlas: false,
      basePrompt: '',
    },
    'github': {
      appId: secrets.github.appId,
      appSecret: secrets.github.appSecret,
    },
    [localPlugin('./plugins/api')]: {},
    [localPlugin('./plugins/do')]: {},
    [localPlugin('./plugins/dynamic')]: {},
    [localPlugin('./plugins/eval')]: {},
    [localPlugin('./plugins/graphviz')]: {},
    [localPlugin('./plugins/regex')]: {},
    [localPlugin('./plugins/trivial')]: {},
    [localPlugin('./plugins/type')]: {},
    [localPlugin('./plugins/notify')]: {},
    [localPlugin('./plugins/onedice')]: {},
    [localPlugin('./plugins/ppt')]: {
      panelToken: secrets.panel.token,
    },
  },
}
