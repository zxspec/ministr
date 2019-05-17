const PageContext = require('./PageContext')

describe('PageContext', () => {
  let pageData
  beforeEach(() => {
    pageData = new PageContext()
  })

  describe('mocks', () => {
    it('should contain "mocks" array field', () => {
      expect(pageData.mocks).toBeInstanceOf(Array)
    })
  })

  describe('cookies', () => {
    it('should contain "cookies" array field', () => {
      expect(pageData.cookies).toBeInstanceOf(Array)
    })
  })
})
