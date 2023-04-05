import { internal } from 'koishi-plugin-eval/lib/worker'
import lodash from 'lodash'

internal.setGlobal('_', lodash, false)
internal.setGlobal('l', lodash, false)
internal.setGlobal('lodash', lodash, false)
