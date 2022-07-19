require('coffeescript/register')
let { internal } = require('@koishijs/plugin-eval/lib/worker')

const lodash = require('lodash')
internal.setGlobal('_', lodash, false)
internal.setGlobal('l', lodash, false)
internal.setGlobal('lodash', lodash, false)

const ramda = require('ramda')
internal.setGlobal('r', ramda, false)
internal.setGlobal('ramda', ramda, false)

internal.setGlobal('sa', require('superagent'), false)
internal.setGlobal('moment', require('moment-timezone'), false)
internal.setGlobal('jp', require('jsonpath'), false)
internal.setGlobal('mockjs', require('mockjs'), false)
internal.setGlobal('emmet', require('emmet').default, false)
//internal.setGlobal('rand', require('@stdlib/random-base-mt19937'), false)