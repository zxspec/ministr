const Context = require('./Context')

describe('Context', () => {
  let context
  let fn1

  beforeEach(() => {
    context = new Context()
    fn1 = jest.fn()
  })

  it('should have own property "chain"', () => {
    expect(context.hasOwnProperty('chain')).toBe(true)
  })

  it('should have own property "browser"', () => {
    expect(context.hasOwnProperty('browser')).toBe(true)
  })

  it('should have own property "page"', () => {
    expect(context.hasOwnProperty('page')).toBe(true)
  })

  it('should have a "pages" Map property', () => {
    expect(context.hasOwnProperty('pages')).toBe(true)
    expect(context.pages).toBeInstanceOf(Map)
  })

  it('should have a baseUrl:URL property', () => {
    expect(context.hasOwnProperty('baseUrl')).toBe(true)
  })

  describe('extendChain', () => {
    it('should return promise', () => {
      const result = context.extendChain(() => {})
      expect(result).toBeInstanceOf(Promise)
    })

    it('should extend promise chain with provided sync function', async () => {
      await context.extendChain(fn1).then(() => {
        expect(fn1).toHaveBeenCalledTimes(1)
      })
    })

    it('should extend promise chain with provided async function', async () => {
      await context
        .extendChain(async () => fn1())
        .then(() => {
          expect(fn1).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('setBaseUrl', () => {
    const validUrlString = 'https://www.example.com'
    const invalidUrlString = 'test'
    const baseUrl = new URL('', validUrlString)

    it('should create URL out valid string', () => {
      context.setBaseUrl(validUrlString)
      expect(context.baseUrl).toBeInstanceOf(URL)
      expect(context.baseUrl.href).toBe('https://www.example.com/')
    })

    it('should throw error if provided string is invalid', () => {
      expect(() => {
        context.setBaseUrl(invalidUrlString)
      }).toThrow()
    })

    it('should just assign provided value if it is instanse of URL class', () => {
      context.setBaseUrl(baseUrl)
      expect(context.baseUrl).toBeInstanceOf(URL)
      expect(context.baseUrl.href).toBe('https://www.example.com/')
    })
  })
})
