import { Context, Logger, s } from 'koishi'
import type {} from '@koishijs/plugin-puppeteer'
import type { Page, ElementHandle, BinaryScreenshotOptions } from 'puppeteer-core'

const logger = new Logger('d')

export function apply(ctx: Context) {
    ctx.using(['puppeteer'], () => {
        ctx.plugin(d)
    })
}

function d(ctx: Context) {
    ctx.command('d <id:number> <index:number>')
        .shortcut('鹿乃动态', { args: ['316381099', '3'] })
        .action(async (_, id, index = 1) => {
            if (!id) return 'id is required'
            try {
                const page = await ctx.puppeteer.page()
                await page.setViewport({ width: 1920, height: 1080})
                await page.goto(`https://space.bilibili.com/${id}/dynamic`)
                const handle = await page.waitForXPath(`//*[@id="page-dynamic"]/div[1]/div/div/div[${index}]`)
                const shot = await handle.screenshot({ encoding: 'binary' })
                return s.image(shot)
            } catch (e) {
                logger.error(e)
                return String(e)
            }
        })
    ctx.command('x <url:string> <xpath:rawtext>', { authority: 3 })
        .option('fullpage', '-f')
        .action(async ({ options }, url, xpath = '//body') => {
            if (!url) return 'url is required'
            try {
                const page = await ctx.puppeteer.page()
                let handle: ElementHandle | Page
                const shotOptions = { encoding: 'binary' } as BinaryScreenshotOptions
                if (options.fullpage) {
                    shotOptions.fullPage = true;
                    await page.goto(s.unescape(url))
                    handle = page
                } else {
                    await page.setViewport({ width: 1920, height: 1080 })
                    await page.goto(s.unescape(url))
                    handle = await page.waitForXPath(xpath)
                }
                const shot = await handle.screenshot(shotOptions) as Buffer
                return s.image(shot)
            } catch (e) {
                logger.error(e)
                return String(e)
            }
        })
}