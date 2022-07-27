import { Context, Logger, segment } from 'koishi'
import type {} from '@koishijs/plugin-puppeteer'
import type { Page, ElementHandle, BinaryScreenshotOptions } from 'puppeteer-core'

const logger = new Logger('ppt')

export interface PPTConfig {
    panelToken: string
}

export const name = 'ppt'

export function apply(ctx: Context, config: PPTConfig) {
    ctx.using(['puppeteer'], () => {
        ctx.plugin(ppt, config)
    })
}

function ppt(ctx: Context, config: PPTConfig) {
    ctx.command('dynamic <id:number> <index:number>')
        .alias('d')
        .shortcut('鹿乃动态', { args: ['316381099', '3'] })
        .action(async (_, id, index = 1) => {
            if (!id) return 'id is required'
            let page: Page
            try {
                page = await ctx.puppeteer.page()
                await page.setViewport({ width: 1920, height: 1080 })
                await page.goto(`https://space.bilibili.com/${id}/dynamic`)
                const handle = await page.waitForXPath(`//*[@id="page-dynamic"]/div[1]/div/div/div[${index}]`)
                const shot = await handle.screenshot({ encoding: 'binary' })
                return segment.image(shot)
            } catch (e) {
                logger.error(e)
                return String(e)
            } finally {
                page?.close()
            }
        })
    ctx.command('x <url:string> <xpath:rawtext>', { authority: 3 })
        .option('fullpage', '-f')
        .action(async ({ options }, url, xpath = '//body') => {
            if (!url) return 'url is required'
            let page: Page
            try {
                page = await ctx.puppeteer.page()
                let handle: ElementHandle | Page
                const shotOptions = { encoding: 'binary' } as BinaryScreenshotOptions
                if (options.fullpage) {
                    shotOptions.fullPage = true;
                    await page.goto(segment.unescape(url))
                    handle = page
                } else {
                    await page.setViewport({ width: 1920, height: 1080 })
                    await page.goto(segment.unescape(url))
                    handle = await page.waitForXPath(xpath)
                }
                const shot = await handle.screenshot(shotOptions) as Buffer
                return segment.image(shot)
            } catch (e) {
                logger.error(e)
                return String(e)
            } finally {
                page?.close()
            }
        })
    ctx.command('panel', { authority: 2 })
        .action(async () => {
            let page: Page
            try {
                page = await ctx.puppeteer.page()
                await page.setViewport({ width: 1920, height: 1080 })
                await page.setExtraHTTPHeaders({
                    'Authorization': `Bearer ${config.panelToken}`
                })
                await page.goto('http://10.11.0.1:3000/d/VrQU-6U7z/anillc-network-dashboard')
                await page.waitForNetworkIdle()
                const handle = await page.waitForXPath('//*[@id="reactRoot"]/div/main/div[3]/div/div/div[1]/div/div')
                const shot = await handle.screenshot({ encoding: 'binary' })
                return segment.image(shot)
            } catch (e) {
                return String(e)
            } finally {
                page?.close()
            }
        })
}