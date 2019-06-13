const { from, isResponseLikeObject } = require('./responseMock')

describe('from()', () => {
  it('should return object with', () => {
    const result = from()
    expect(result).toBeInstanceOf(Object)
  })

  describe('default field values', () => {
    let result
    beforeEach(() => {
      result = from()
    })

    it('should provide 200 as a defult status value', () => {
      expect(result.status).toBe(200)
    })
    it('should provide "application/jsom" as a defult content type', () => {
      expect(result.contentType).toBe('application/json')
    })
    it('should provide Buffer created from an empty string', () => {
      expect(result.body).toBeInstanceOf(Buffer)
      const emptyStringBuffer = Buffer.from(JSON.stringify(''))
      expect(result.body.equals(emptyStringBuffer)).toBe(true)
    })
  })

  describe('body field', () => {
    describe('when input value is not an object', () => {
      it('should be a instance of Buffer class created from input value', () => {
        let result
        let buffer

        result = from('test')
        buffer = Buffer.from(JSON.stringify('test'))
        expect(result.body.equals(buffer)).toBe(true)

        result = from(1)
        buffer = Buffer.from(JSON.stringify(1))
        expect(result.body.equals(buffer)).toBe(true)
      })
    })

    describe('when input value is an object having "status" or "contentType" or "body"', () => {
      describe('when input value "body" field is an instance of Buffer class', () => {
        it('should be an input value', () => {
          const testBuffer = Buffer.from('test')
          const result = from({
            body: testBuffer
          })
          expect(result.body.equals(testBuffer)).toBe(true)
        })
      })

      it('should be a instance of Buffer class created from input value "body" field', () => {
        const testWithBodyObject = { body: 'test' }
        const result = from(testWithBodyObject)
        const buffer = Buffer.from(JSON.stringify(testWithBodyObject.body))
        expect(result.body.equals(buffer)).toBe(true)
      })
    })

    describe('when input value is an object without "status", "contentType", "body" fields', () => {
      describe('when input value is a Buffer class instance', () => {
        it('should be an instance of Buffer class created from input value', () => {
          const buffer = Buffer.from('test')
          const result = from(buffer)
          expect(result.body.equals(buffer)).toBe(true)
        })
      })

      describe('when input value is not a Buffer class instance', () => {
        it('should be an input value', () => {
          const objectToCreateBufferFrom = { someField: 'test' }
          const result = from(objectToCreateBufferFrom)
          const buffer = Buffer.from(JSON.stringify(objectToCreateBufferFrom))
          expect(result.body.equals(buffer)).toBe(true)
        })
      })
    })
  })
})

describe('isResponseLikeObject()', () => {
  it('should return true if object has "body" or "status" or "contentType"', () => {
    let result

    result = isResponseLikeObject({})
    expect(result).toBe(false)

    result = isResponseLikeObject({ body: [] })
    expect(result).toBe(true)

    result = isResponseLikeObject({ status: 1 })
    expect(result).toBe(true)

    result = isResponseLikeObject({ contentType: 'test' })
    expect(result).toBe(true)
  })

  it('should return false for any Buffer instance', () => {
    const result = isResponseLikeObject(Buffer.from('test'))
    expect(result).toBe(false)
  })

  it('should return false for any primitive value', () => {
    let result

    result = isResponseLikeObject()
    expect(result).toBe(false)

    result = isResponseLikeObject(null)
    expect(result).toBe(false)

    result = isResponseLikeObject('')
    expect(result).toBe(false)

    result = isResponseLikeObject(1)
    expect(result).toBe(false)

    result = isResponseLikeObject(Symbol('test'))
    expect(result).toBe(false)
  })
})
