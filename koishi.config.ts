import { resolve } from 'path'

const secrets = require(process.env.SECRETS)
const pwd = process.env.PWD

function localPlugin(path: string) {
  return resolve(__dirname, path)
}

export default {
  prefix: '-',
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
    'teach': {},
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
      browser: {
        args: ['--no-sandbox'],
      }
    },
    'assets-local': {
      root: resolve(pwd, '.koishi/assets')
    },
    'eval': {
      scriptLoader: 'coffeescript',
      setupFiles: {
        'inj': resolve(__dirname, './inj/index.js'),
      },
      storageFile: resolve(pwd, '.koishi/storage'),
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
    [localPlugin('./src/api')]: {},
    [localPlugin('./src/do')]: {},
    [localPlugin('./src/dynamic')]: {},
    [localPlugin('./src/eval')]: {},
    [localPlugin('./src/graphviz')]: {},
    [localPlugin('./src/regex')]: {},
    [localPlugin('./src/trivial')]: {},
    [localPlugin('./src/type')]: {},
    [localPlugin('./src/notify')]: {},
    [localPlugin('./src/ppt')]: {
      panelToken: secrets.panel.token,
    },
  },
}
