const { from } = require('./responseMock')

describe('from', () => {
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
    describe('when input value has no "body" field', () => {
      it('should be a instance of Buffer class created from input value', () => {
        let result
        let buffer

        result = from('test')
        buffer = Buffer.from(JSON.stringify('test'))
        expect(result.body.equals(buffer)).toBe(true)

        result = from(1)
        buffer = Buffer.from(JSON.stringify(1))
        expect(result.body.equals(buffer)).toBe(true)

        result = from({})
        buffer = Buffer.from(JSON.stringify(''))
        expect(result.body.equals(buffer)).toBe(true)
      })
    })

    describe('when input value has "body" field', () => {
      it('should be a instance of Buffer class created from input value', () => {
        const testWithBodyObject = { body: 'test' }
        const result = from(testWithBodyObject)
        const buffer = Buffer.from(JSON.stringify(testWithBodyObject.body))
        expect(result.body.equals(buffer)).toBe(true)
      })

      it('should return the same buffer when "body" is a buffer', () => {
        const testBuffer = Buffer.from('test')
        const result = from({ body: testBuffer })
        expect(result.body.equals(testBuffer)).toBe(true)
      })
    })

    describe('when input value is a Buffer', () => {
      it('should return the same buffer', () => {
        const testBuffer = Buffer.from('test')
        const result = from(testBuffer)
        expect(result.body.equals(testBuffer)).toBe(true)
      })
    })
  })
})
