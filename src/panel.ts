import { Context, segment } from 'koishi'
import type { Page } from 'puppeteer-core'

export interface PanelConfig {
    token: string
}

export const using = ['puppeteer']

export function apply(ctx: Context, config: PanelConfig) {
    ctx.command('panel', { authority: 2 })
        .action(async () => {
            let page: Page
            try {
                page = await ctx.puppeteer.page()
                await page.setViewport({ width: 1920, height: 1080 })
                await page.setExtraHTTPHeaders({
                    'Authorization': `Bearer ${config.token}`
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