const { createPageIfMissing } = require('./utils')

describe('utils', () => {
  describe('createPageIfMissing', () => {
    let ctx
    const browser = {}
    const fakeNewPage = {}
    const fakeNewPage2 = {}

    beforeEach(() => {
      browser.newPage = jest
        .fn(async () => fakeNewPage2)
        .mockImplementationOnce(() => fakeNewPage)
      ctx = { page: null, browser }
    })

    it('should create new page when context`s "page" property has falsy value', async () => {
      expect(ctx.page).toBeFalsy()
      await createPageIfMissing(ctx)
      expect(ctx.page).toBe(fakeNewPage)
    })

    it('should not create new page if context already has it', async () => {
      await createPageIfMissing(ctx)
      await createPageIfMissing(ctx)
      expect(ctx.page).toBe(fakeNewPage)
      expect(browser.newPage).toHaveBeenCalledTimes(1)
    })
  })
})
