import { Context, Logger, segment } from 'koishi'
import { exportToBuffer } from '@ts-graphviz/node'
import { Page } from 'puppeteer-core'

const logger = new Logger('graphviz')

export const using = ['puppeteer']

export function apply(ctx: Context) {
    ctx.command('graph <script:rawtext>')
        .alias('g')
        .option('rankdir', '-r <rankdir:rawtext>')
        .action(({ options }, script) => {
            return render(`
                graph {
                    rankdir = ${options.rankdir || 'LR'}
                    ${script}
                }
            `)
        })
    ctx.command('digraph <script:rawtext>')
        .alias('dg')
        .option('rankdir', '-r <rankdir:rawtext>')
        .action(({ options }, script) => {
            return render(`
                digraph {
                    rankdir = ${options.rankdir || 'LR'}
                    ${script}
                }
            `)
        })
    ctx.command('dotgif <...dots>')
        .option('delay', '-d <delay:int>')
        .option('duration', '-u <duration:int>')
        .option('fps', '-f <fps:int>')
        .option('circle', '-c')
        .check(({ options }) => {
            if (options.fps > 100) return 'fps 过大'
        })
        .action(async ({ options }, ...dots) => {
            let page: Page
            try {
                const query = JSON.stringify({ ...options, dots })
                page = await ctx.puppeteer.page()
                await page.goto(`https://d3-graphviz-to-gif.vercel.app?${encodeURIComponent(query)}`)
                const gif = await page.waitForSelector('#gif')
                const url = await gif.evaluate(e => (e as any).src)
                return segment.image('base64://' + url.slice(22))
            } catch (e) {
                logger.error(e)
                return '渲染时发生错误: ' + e
            } finally {
                page?.close()
            }
        })
}

async function render(script: string) {
    let image: Buffer
    try {
        image = await exportToBuffer(script, { format: 'png' })
    } catch (e) {
        logger.error(e)
        return '渲染时发生错误' + (e.stderr ? `: ${e.stderr.toString().slice(38)}` : '').trim()
    }
    return segment.image(image)
}