let { internal } = require('koishi-plugin-eval/lib/worker')

internal.setGlobal('sa', require('superagent'), false)
internal.setGlobal('_', require('lodash'), false)
internal.setGlobal('cheerio', require('cheerio'), false)
internal.setGlobal('rxjs', require('rxjs'), false)
internal.setGlobal('moment', require('moment'), false)
internal.setGlobal('jp', require('jsonpath'), false)
internal.setGlobal('Hl', require('./Hl'), false)
internal.setGlobal('trans', require('./trans'), false)
internal.setGlobal('mockjs', require('mockjs'), false)
