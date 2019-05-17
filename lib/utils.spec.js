const { createPageIfMissing, mockPageRequests } = require('./utils')
const EventEmitter = require('events')
const Context = require('./Context')
const RequestMock = require('./requestMock')
const ResponseMock = require('./responseMock')
const PageContext = require('./PageContext')
const {
  url1GetParams,
  url2PostParams,
  fakeUrl1GetRequest,
  fakeUrl2PostRequest
} = require('./requestMock.fake')

describe('utils', () => {
  beforeEach(() => {
    fakeUrl1GetRequest.respond.mockClear()
    fakeUrl1GetRequest.continue.mockClear()
    fakeUrl2PostRequest.respond.mockClear()
    fakeUrl2PostRequest.continue.mockClear()
  })

  describe('createPageIfMissing', () => {
    let ctx
    const browser = {}
    const fakeNewPage = {}
    const fakeNewPage2 = {}

    beforeEach(() => {
      browser.newPage = jest
        .fn(async () => fakeNewPage2)
        .mockImplementationOnce(() => fakeNewPage)
      ctx = new Context()
      ctx.browser = browser
    })

    describe('when context has no page', () => {
      it('should create new page', async () => {
        expect(ctx.page).toBeFalsy()
        await createPageIfMissing(ctx)
        expect(ctx.page).toBe(fakeNewPage)
      })

      it('should initialize PageContext for a new page', async () => {
        expect(ctx.page).toBeFalsy()
        await createPageIfMissing(ctx)
        const page = ctx.page
        expect(ctx.pages.get(page)).toBeInstanceOf(PageContext)
      })
    })

    describe('when context has page', () => {
      it('should not create new page if context already has it', async () => {
        await createPageIfMissing(ctx)
        await createPageIfMissing(ctx)
        expect(ctx.page).toBe(fakeNewPage)
        expect(browser.newPage).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('mockPageRequests', () => {
    let ctx
    let fakeNewPage
    let fakePageContext
    const url1GetResponse = { test: 'url1' }
    const url2PostResponse = { test: 'url2' }

    beforeEach(() => {
      jest.spyOn(ResponseMock, 'from')
      fakeNewPage = new EventEmitter()
      fakeNewPage.setRequestInterception = jest.fn(() => Promise.resolve())
      jest.spyOn(fakeNewPage, 'on')

      fakePageContext = new PageContext()
      fakePageContext.mocks = [
        new RequestMock(url1GetParams, url1GetResponse),
        new RequestMock(url2PostParams, url2PostResponse)
      ]
      ctx = new Context()
      ctx.page = fakeNewPage
      ctx.pages.set(fakeNewPage, fakePageContext)
    })

    describe('with request mocks', () => {
      it('should enable request interception', async () => {
        await mockPageRequests(ctx)

        expect(fakeNewPage.setRequestInterception).toHaveBeenCalledTimes(1)
        expect(fakeNewPage.setRequestInterception).toHaveBeenCalledWith(true)
      })

      it('should assign a "request" event handler once', async () => {
        await mockPageRequests(ctx)

        expect(fakeNewPage.on).toHaveBeenCalledTimes(1)
        expect(fakeNewPage.on).toHaveBeenCalledWith(
          'request',
          expect.any(Function)
        )
      })

      it('should return mocked responses for matched requests only', async () => {
        await mockPageRequests(ctx)
        await fakeNewPage.emit('request', fakeUrl1GetRequest)
        await fakeNewPage.emit('request', fakeUrl2PostRequest)

        expect(fakeUrl1GetRequest.respond).toHaveBeenCalledTimes(1)
        expect(fakeUrl2PostRequest.respond).toHaveBeenCalledTimes(1)

        const fromResponse1 = ResponseMock.from.mock.results[0].value
        const fromResponse2 = ResponseMock.from.mock.results[1].value
        expect(fakeUrl1GetRequest.respond).toHaveBeenCalledWith(fromResponse1)
        expect(fakeUrl2PostRequest.respond).toHaveBeenCalledWith(fromResponse2)
      })

      it('should respond with first applicable response, for the multiple mocks with same parameters,', async () => {
        ResponseMock.from.mockClear()
        fakePageContext.mocks = [
          new RequestMock(url1GetParams),
          new RequestMock(url1GetParams)
        ]
        ctx.pages.set(fakeNewPage, fakePageContext)

        await mockPageRequests(ctx)
        await fakeNewPage.emit('request', fakeUrl1GetRequest)

        const fromResponse1 = ResponseMock.from.mock.results[0].value
        expect(fakeUrl1GetRequest.respond).toHaveBeenCalledTimes(1)
        expect(fakeUrl1GetRequest.respond).toHaveBeenCalledWith(fromResponse1)

        expect(fakeUrl1GetRequest.continue).not.toHaveBeenCalled()
      })

      it('should not mock requests that do not match', async () => {
        fakePageContext.mocks = [new RequestMock(url1GetParams)]
        ctx.pages.set(fakeNewPage, fakePageContext)

        await mockPageRequests(ctx)
        await fakeNewPage.emit('request', fakeUrl2PostRequest)

        expect(fakeUrl2PostRequest.continue).toHaveBeenCalledTimes(1)
        expect(fakeUrl2PostRequest.respond).not.toHaveBeenCalled()
      })
    })

    describe('without request mocks', () => {
      it('should mock requests if mocks are availble in context', async () => {
        fakePageContext = new PageContext()
        fakePageContext.mocks = []
        ctx.pages.set(fakeNewPage, fakePageContext)

        await mockPageRequests(ctx)

        expect(fakeNewPage.setRequestInterception).toHaveBeenCalledTimes(0)
        expect(fakeNewPage.setRequestInterception).not.toHaveBeenCalled()
      })
    })
  })
})
