import { Context, Logger, User } from 'koishi'
import { nanoid } from 'nanoid'
import cors from '@koa/cors'

declare module 'koishi' {
    interface User {
        apiToken: string
    }
}

declare module 'koa' {
    interface DefaultContext {
        user: User
    }
}

export const name = 'api'

const logger = new Logger('api')

export function apply(ctx: Context) {
    ctx.model.extend('user', {
        apiToken: 'string'
    })
    ctx.using(['database'], api)
    ctx.private().command('api.register', { authority: 3 })
        .userFields(['apiToken'])
        .option('revoke', '-r 撤销原有 token 并重新生成')
        .action(({ session, options }) => {
            const { user } = session
            if (user.apiToken && !options.revoke) {
                return `您的 token: ${user.apiToken}`
            }
            const token = user.apiToken = nanoid()
            return `您的新 token: ${token}`
        })
}

function api(ctx: Context) {
    const router = ctx.router.prefix('/api/:token')
        .use(cors())
        .use(async (koaCtx, next) => {
            const { token } = koaCtx.params
            try {
                const user = (await ctx.database.get('user', { apiToken: token }))?.[0]
                if (!user) return
                koaCtx.user = user
                return next()
            } catch (e) {
                logger.error(e)
                koaCtx.status = 500
                koaCtx.body = String(e)
            }
        })
    router.get('/send/:platform', async koaCtx => {
        const { user, params, query } = koaCtx
        const { msg } = query
        const uid = user[params.platform] as string
        const bot = ctx.bots.find(bot => bot.platform === params.platform)
        if (!uid || !bot) {
            koaCtx.status = 404
            koaCtx.body = '请检查 uid 和 platform 是否正确。'
            return
        }
        try {
            const messageId = await bot.sendPrivateMessage(uid, Array.isArray(msg) ? msg.join(' ') : msg)
            koaCtx.status = 200
            koaCtx.body = JSON.stringify(messageId)
        } catch (e) {
            koaCtx.status = 500
            koaCtx.body = String(e)
        }
    })
}