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
})
