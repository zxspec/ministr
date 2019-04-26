const createPageIfMissing = async ctx => {
  if (!ctx.page) {
    ctx.page = await ctx.browser.newPage()
  }
}

module.exports = {
    createPageIfMissing
}