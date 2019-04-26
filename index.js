const puppeteer = require('puppeteer')
const Context = require('./lib/Context')
const utils = require('./lib/utils')

let ctx = new Context()

class Ministr extends Promise {
  getBrowser() {
    return ctx.browser
  }

  getPage() {
    return ctx.page
  }

  close() {
    return ctx.extendChain(async () => {
      await ctx.browser.close()
      ctx.browser = null
    })
  }

  visit(url, options = {}) {
    return ctx.extendChain(async () => {
      await utils.createPageIfMissing(ctx)
      if(options.auth) {
        await ctx.page.authenticate(options.auth);
      }
      await ctx.page.goto(url)
    })
  }

  setCookie(cookie) {
    return ctx.extendChain(async () => {
      await utils.createPageIfMissing(ctx)
      await ctx.page.setCookie(cookie)
    })
  }

  mockRequest(requestParams, response) {
    return ctx.extendChain(async () => {
      await utils.createPageIfMissing(ctx)
      await ctx.page.setRequestInterception(true)

      ctx.page.on('request', req => {
        const isUrlMatch = requestParams.url.test(req.url())
        const isMethodMatch = (requestParams.method || 'GET') === req.method()
        if (isUrlMatch && isMethodMatch) {
          req.respond(response)
        } else {
          req.continue()
        }
      })
    })
  }
}

const ministr = (options, newContext = {}) => {
  const defaultOptions = {
    headless: false,
    devtools: true
  }
  ctx.chain = Ministr.resolve().then(() =>
    puppeteer
      .launch({
        ...defaultOptions,
        ...options
      })
      .then(browser => {
        ctx.browser = browser
      })
  )

  Object.assign(ctx, newContext)
  Object.seal(ctx)

  return Ministr.resolve()
}

module.exports = ministr
