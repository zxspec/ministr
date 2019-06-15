const puppeteer = require('puppeteer')
const Context = require('./Context')
const utils = require('./utils')
const RequestMock = require('./requestMock')

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
      await utils.mockPageRequests(ctx)
      if (options.auth) {
        await ctx.page.authenticate(options.auth)
      }
      if (ctx.baseUrl) {
        const urlToVisit = new URL(url, ctx.baseUrl)
        await ctx.page.goto(urlToVisit.href)
      } else {
        await ctx.page.goto(url)
      }
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
      const mock = new RequestMock(requestParams, response)
      const pageContext = ctx.pages.get(ctx.page)
      pageContext.mocks.push(mock)
    })
  }
}

const ministr = (options, newContext = {}) => {
  const defaultOptions = {
    headless: false,
    devtools: true
  }

  if (options.baseUrl) {
    ctx.setBaseUrl(options.baseUrl)
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
