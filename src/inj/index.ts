import { internal } from 'koishi-plugin-eval/lib/worker'
import lodash from 'lodash'
import ramda from 'ramda'
import superagent from 'superagent'
import moment from 'moment-timezone'
import jsonpath from 'jsonpath'
import mockjs from 'mockjs'
import emmet from 'emmet'

internal.setGlobal('_', lodash, false)
internal.setGlobal('l', lodash, false)
internal.setGlobal('lodash', lodash, false)

internal.setGlobal('r', ramda, false)
internal.setGlobal('ramda', ramda, false)

internal.setGlobal('sa', superagent, false)
internal.setGlobal('moment', moment, false)
internal.setGlobal('jp', jsonpath, false)
internal.setGlobal('mockjs', mockjs, false)
internal.setGlobal('emmet', emmet, false)