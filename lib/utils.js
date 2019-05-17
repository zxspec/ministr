const PageContext = require('./PageContext')

const createPageIfMissing = async ctx => {
  if (!ctx.page) {
    ctx.page = await ctx.browser.newPage()
    ctx.pages.set(ctx.page, new PageContext())
  }
}

const mockPageRequests = async ctx => {
  const pageContext = ctx.pages.get(ctx.page)
  if (pageContext.mocks.length) {
    await ctx.page.setRequestInterception(true)
    ctx.page.on('request', req => {
      const pageContext = ctx.pages.get(ctx.page)
      const isMocked = pageContext.mocks.some(mock => {
        if (mock.match(req)) {
          req.respond(mock.getResponse())
          return true
        }
      })
      if (!isMocked) {
        return req.continue()
      }
    })
  }
}

module.exports = {
  createPageIfMissing,
  mockPageRequests
}
