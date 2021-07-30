path = require 'path'
simpleGit = require 'simple-git'

module.exports = (ctx) ->
  git = simpleGit path.resolve __dirname, '..'
  ctx.command 'update', { authority: 3 }
    .action ->
      try
        res = await git.pull()
        console.log res
        process.exit() if res.changes > 0
        return '已是最新状态'
      catch e
        return e.toString()