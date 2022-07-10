import { Context, Logger, User, Session, Router } from 'koishi'
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
        platform: string
    }
}

export interface ApiConfig {
    platform: string
}

interface Response {
    code: number
    message: string
    data: any
}

function response(res: Partial<Response>): Response {
    return {
        code: 200,
        message: 'success',
        data: null,
        ...res
    }
}

export const name = 'api'

const logger = new Logger('api')

export function apply(ctx: Context, config: ApiConfig) {
    config = {
        platform: 'onebot',
        ...config
    }
    ctx.model.extend('user', {
        apiToken: 'string'
    })
    ctx.using(['database'], ctx => {
        ctx.router.use('/api', router(ctx, config).routes())
    })
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

function router(ctx: Context, config: ApiConfig) {
    const newRouter = new Router()
    const router = newRouter.prefix('/:token')
    router.use(cors())
        .use(async (koaCtx, next) => {
            const { token } = koaCtx.params
            let { platform } = koaCtx.query
            if (!platform) {
                platform = config.platform
            }
            if (Array.isArray(platform)) {
                koaCtx.body = response({ code: 403, message: 'multiple platforms passed' })
                return
            }
            try {
                const user = (await ctx.database.get('user', { apiToken: token }))?.[0]
                if (!user) return
                koaCtx.user = user
                koaCtx.platform = platform
                return next()
            } catch (e) {
                logger.error(e)
                koaCtx.body = response({ code: 500, message: String(e) })
            }
        })
    router.get('/send', async koaCtx => {
        const { user, query, platform } = koaCtx
        const { message } = query
        const uid = user[platform] as string
        const bot = ctx.bots.find(bot => bot.platform === platform)
        if (!uid || !bot || !message) {
            koaCtx.body = response({ code: 403, message: 'check params' })
            return
        }
        try {
            const messageId = await bot.sendPrivateMessage(uid, Array.isArray(message) ? message.join(' ') : message)
            koaCtx.status = 200
            koaCtx.body = response({ data: messageId })
        } catch (e) {
            koaCtx.body = response({ code: 500, message: String(e) })
        }
    })
    router.get('/prompt', async koaCtx => {
        const { user, query, platform } = koaCtx
        const { message, timeout } = query
        const uid = user[platform] as string
        const bot = ctx.bots.find(bot => bot.platform === platform)
        if (!uid || !bot) {
            koaCtx.body = response({ code: 403, message: 'check uid or platform' })
            return
        }
        const session = new Session(bot, {
            userId: user[platform],
            channelId: `private:${user[platform]}`
        })
        try {
            let messageId = []
            if (message) {
                messageId = await session.send(Array.isArray(message) ? message.join(' ') : message)
            }
            const parsedTimeout = parseInt(Array.isArray(timeout) ? timeout[0] : timeout)
            const res = await session.prompt(parsedTimeout ? parsedTimeout : undefined)
            if (!res) {
                koaCtx.body = response({ code: 206, message: 'timeout', data: { ask: messageId }})
                return
            }
            koaCtx.body = response({
                data: {
                    ask: messageId,
                    response: res,
                }
            })
        } catch (e) {
            koaCtx.body = response({ code: 500, message: String(e) })
        }
    })
    return newRouter
}