{ s } = require 'koishi'

getText = (element, page) -> await page.evaluate ((e) -> e.innerText), element

module.exports = (ctx) ->
  cmd = ctx.command 'd <uid:number> <i:number>'
  cmd.shortcut '鹿乃动态', { args: [316381099, 3] }
    .action (_, uid, i = 1) ->
      try
        return '<uid> is required' if !uid
        page = await ctx.puppeteer.page()
        await page.setViewport
          width: 1920
          height: 1080
        await page.goto "https://space.bilibili.com/#{uid}/dynamic"
        d = await page.waitForXPath "//*[@id=\"page-dynamic\"]/div[1]/div/div/div[#{i}]"
        img = await d.screenshot
          encoding: 'base64'
        return s 'image', { file: "base64://#{img}" }
      catch e
        console.log e
        return e.toString()
      finally
        page.close()

  cmd.subcommand 'x <url:string> <xpath:text>', { authority: 3 }
    .option 'fullpage', '-f'
    .action ({options} , url, xpath = '//body') ->
      try
        page = await ctx.puppeteer.page()
        if options.fullpage
          await page.goto s.unescape url
          img = await page.screenshot
            encoding: 'base64'
            fullPage: true
        else
          await page.setViewport
            width: 1920
            height: 1080
          await page.goto s.unescape url
          element = await page.waitForXPath (s.unescape xpath),
            visible: true
          img = await element.screenshot
            encoding: 'base64'
      catch e
        return e.toString()
      finally
        page.close()
      return s 'image', { file: "base64://#{img}" }
