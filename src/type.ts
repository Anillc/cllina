import { Context, Logger, segment } from 'koishi';
import { LspServer } from 'typescript-language-server/lib/lsp-server'

const logger = new Logger('type')

const server = new LspServer({
    logger: {
        error() {},
        warn() {},
        info() {},
        log() {},
    },
    lspClient: {
        setClientCapabilites() {},
        createProgressReporter: () => ({
            begin() {},
            report() {},
            end() {},
        }),
        publishDiagnostics() {},
        showMessage(args) {throw args},
        logMessage() {},
        telemetry() {},
        applyWorkspaceEdit: () => Promise.reject('unsupported'),
        rename: () => Promise.reject('unsupported'),
    }
})

function createDoc(code: string) {
    return {
        uri: '',
        languageId: 'typescript',
        version: 1,
        text: code,
    }
}

export const name = 'type'

export async function apply(ctx: Context) {
    await server.initialize({
        processId: null,
        rootUri: null,
        capabilities: {},
        workspaceFolders: null,
    })
    ctx.command('type <name> <code:rawtext>', { authority: 2 })
        .action(async (_, name, code) => {
            code = `${code}\ntype _T = ${segment.unescape(name)}`
            const doc = createDoc(code)
            server.didOpenTextDocument({ textDocument: doc })
            try {
                const res = await server.hover({
                    textDocument: doc,
                    position: {
                        line: code.split('\n').length - 1,
                        character: 6,
                    }
                })
                const contents = res.contents as any
                if (contents.length == 0) {
                    return '没有生成类型提示'
                }
                return contents[0].value
            } catch (e) {
                logger.error(e)
                return '生成类型提示时发生错误'
            }
        })
}