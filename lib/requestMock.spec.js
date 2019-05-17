const RequestMock = require('./requestMock')
const ResponseMock = require('./responseMock')
const {
  url1,
  url2,
  url1GetParams,
  url2GetParams,
  url1PostParams,
  url2PostParams,
  regex1GetParams,
  regex2GetParams,
  regex1PostParams,
  regex2PostParams,
  fakeUrl1GetRequest,
  fakeUrl2PostRequest
} = require('./requestMock.fake')

describe('request mock', () => {
  let result
  beforeEach(() => {
    jest.spyOn(ResponseMock, 'from').mockClear()
  })

  it('has to return object based on parameters request', () => {
    result = new RequestMock(url1GetParams)
    expect(result).toBeInstanceOf(Object)
  })

  describe('constructor', () => {
    it('should create a ResponseMock from provided value', () => {
      new RequestMock(url1GetParams, 'test')
      expect(ResponseMock.from).toHaveBeenCalledTimes(1)
    })

    it('should create a ResponseMock from each of provided values', () => {
      new RequestMock(url1GetParams, ['test1', 'test2', 'test3'])
      expect(ResponseMock.from).toHaveBeenCalledTimes(3)
    })
  })

  describe('match()', () => {
    describe('URL parameter is a string', () => {
      it('should return true if both "url" and "method" match request', () => {
        result = new RequestMock(regex1GetParams).match(fakeUrl1GetRequest)
        expect(result).toBe(true)

        result = new RequestMock(regex2GetParams).match(fakeUrl1GetRequest)
        expect(result).toBe(false)

        result = new RequestMock(regex1PostParams).match(fakeUrl2PostRequest)
        expect(result).toBe(false)

        result = new RequestMock(regex2PostParams).match(fakeUrl2PostRequest)
        expect(result).toBe(true)
      })
    })

    describe('URL parameter is a RegExp', () => {
      it('should return true if both "url" and "method" match request', () => {
        result = new RequestMock(url1GetParams).match(fakeUrl1GetRequest)
        expect(result).toBe(true)

        result = new RequestMock(url2GetParams).match(fakeUrl1GetRequest)
        expect(result).toBe(false)

        result = new RequestMock(url1PostParams).match(fakeUrl2PostRequest)
        expect(result).toBe(false)

        result = new RequestMock(url2PostParams).match(fakeUrl2PostRequest)
        expect(result).toBe(true)
      })
    })

    it('should use "GET" when method parameter is omitted', () => {
      result = new RequestMock({ url: url1 }).match(fakeUrl1GetRequest)
      expect(result).toBe(true)
      result = new RequestMock({ url: url2 }).match(fakeUrl1GetRequest)
      expect(result).toBe(false)
    })
  })

  describe('getRespose()', () => {
    let mock
    let fromCallResult

    describe('with single response', () => {
      beforeEach(() => {
        mock = new RequestMock(url1GetParams, {})
        fromCallResult = ResponseMock.from.mock.results[0].value
      })

      it('should return a mocked response', () => {
        expect(mock.getResponse()).toStrictEqual(fromCallResult)
      })
    })

    describe('with multiple responses', () => {
      let fromCallResult1
      let fromCallResult2
      let fromCallResult3

      beforeEach(() => {
        mock = new RequestMock(url1GetParams, [{}, {}, {}])
        fromCallResult1 = ResponseMock.from.mock.results[0].value
        fromCallResult2 = ResponseMock.from.mock.results[1].value
        fromCallResult3 = ResponseMock.from.mock.results[2].value
      })

      it('should use a next response for each request', () => {
        expect(mock.getResponse()).toStrictEqual(fromCallResult1)
        expect(mock.getResponse()).toStrictEqual(fromCallResult2)
        expect(mock.getResponse()).toStrictEqual(fromCallResult3)
      })

      it('should use the last response from a list when all previous responeses have been provided', () => {
        expect(mock.getResponse()).toStrictEqual(fromCallResult1)
        expect(mock.getResponse()).toStrictEqual(fromCallResult2)
        expect(mock.getResponse()).toStrictEqual(fromCallResult3)
        expect(mock.getResponse()).toStrictEqual(fromCallResult3)
        expect(mock.getResponse()).toStrictEqual(fromCallResult3)
      })
    })
  })
})
