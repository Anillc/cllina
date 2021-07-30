path = require 'path'
simpleGit = require 'simple-git'

module.exports = (ctx) ->
  git = simpleGit path.resolve __dirname, '..'
  ctx.command 'update', { authority: 3 }
    .action ({ session }) ->
      try
        res = await git.pull()
        process.exit() if res.changes > 0
      catch e
        return e.toString()