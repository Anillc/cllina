import { Context, Logger, segment } from 'koishi'
import { exportToBuffer } from '@ts-graphviz/node'

const logger = new Logger('graphviz')

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