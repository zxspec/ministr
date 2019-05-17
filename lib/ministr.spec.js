const puppeteer = require('puppeteer')
const EventEmitter = require('events')
const ministr = require('./ministr')
const utils = require('./utils')
const RequestMock = require('./requestMock')
jest.mock('./requestMock')
const Context = require('./Context')

const {
  url1,
  url2,
  url1GetParams,
  url2PostParams
} = require('./requestMock.fake')

const options = {
  headless: true,
  devtools: false
}

describe('ministr', () => {
  let mstr
  let fakePage
  let fakeBrowser
  let context

  beforeEach(() => {
    RequestMock.mockClear()
    jest.spyOn(utils, 'createPageIfMissing').mockClear()
    jest.spyOn(utils, 'mockPageRequests').mockClear()
    fakePage = new EventEmitter()
    Object.assign(fakePage, {
      goto: jest.fn(() => Promise.resolve()),
      setCookie: jest.fn(() => Promise.resolve()),
      setRequestInterception: jest.fn(() => Promise.resolve()),
      authenticate: jest.fn(async () => {})
    })

    fakeBrowser = {
      close: jest.fn(() => Promise.resolve()),
      newPage: jest.fn(() => Promise.resolve(fakePage))
    }

    puppeteer.launch = jest.fn(() => Promise.resolve(fakeBrowser))

    context = new Context()
    context.browser = fakeBrowser
    delete context.chain

    mstr = ministr(options, context)
  })

  it('has to be a Promise', () => {
    expect(mstr).toBeInstanceOf(Promise)
  })

  it('should transfer provider option to puppeteer', async () => {
    await mstr.then(() => {
      expect(puppeteer.launch).toHaveBeenCalledTimes(1)
      const launchCallParams = puppeteer.launch.mock.calls[0]
      expect(launchCallParams[0]).toMatchObject(options)
    })
  })

  describe('getBrowser()', () => {
    it("should return internal puppeter's browser object", () => {
      const browser = mstr.getBrowser()
      expect(browser).toBe(fakeBrowser)
    })
  })

  describe('getPage()', () => {
    it("should return internal puppeter's page object", async () => {
      await mstr.visit(url1)
      const page = mstr.getPage()
      expect(page).not.toBeNull()
    })
  })

  describe('close()', () => {
    it('should add a call to browser.close to the queue', async () => {
      await mstr.close()
      expect(fakeBrowser.close).toHaveBeenCalledTimes(1)
    })

    it('should set to null context.browser once prettier close browser', async () => {
      await mstr.close()
      expect(mstr.getBrowser()).toBeNull()
    })
  })

  describe('visit()', () => {
    it('should create a new page if it does not exists', async () => {
      await mstr.visit(url1)
      expect(utils.createPageIfMissing).toHaveBeenCalled()
    })

    it('should not re-create page if page already exist', async () => {
      await mstr.visit(url1).visit(url2)
      expect(fakeBrowser.newPage).toHaveBeenCalledTimes(1)
    })

    it('should load page for provided URL', async () => {
      await mstr.visit(url1)
      expect(fakePage.goto).toHaveBeenCalledTimes(1)
      expect(fakePage.goto).toHaveBeenCalledWith(url1)
    })

    describe('options', () => {
      it('should use "auth" option for basic authentication', async () => {
        const optionsWithAuth = { auth: {} }
        await mstr.visit(url1, optionsWithAuth)

        expect(fakePage.authenticate).toHaveBeenCalledTimes(1)
        expect(fakePage.authenticate).toHaveBeenCalledWith(optionsWithAuth.auth)

        expect(fakePage.goto).toHaveBeenCalledTimes(1)
        expect(fakePage.goto).toHaveBeenCalledWith(url1)
      })
    })

    describe('with mocked requests', () => {
      beforeEach(async () => {
        await mstr.mockRequest(url1GetParams, [])
        await mstr.mockRequest(url2PostParams, [])
        jest.spyOn(utils, 'mockPageRequests')
      })
    })
  })

  describe('setCookie()', () => {
    const fakeCookie = {
      name: 'x-test',
      value: 'test',
      url: url1
    }

    it('should create a new page if it does not exists', async () => {
      await mstr.setCookie(fakeCookie)
      expect(utils.createPageIfMissing).toHaveBeenCalled()
    })

    it('should set provided cookie', async () => {
      await mstr.setCookie(fakeCookie)
      expect(fakePage.setCookie).toHaveBeenCalledTimes(1)
      expect(fakePage.setCookie).toHaveBeenCalledWith(fakeCookie)
    })
  })

  describe('mockRequest()', () => {
    let fakePages
    const mockedResponse = []

    beforeEach(() => {
      fakePages = new Map()
      context.pages = fakePages
      mstr = ministr(options, context)

      jest.spyOn(mstr, 'mockRequest')
    })

    it('should create a new page if it does not exists', async () => {
      await mstr.mockRequest(url1GetParams, mockedResponse)
      expect(utils.createPageIfMissing).toHaveBeenCalledTimes(1)
    })

    it('should add each new request mock to a page context', async () => {
      let callParams

      await mstr.mockRequest(url1GetParams, mockedResponse)
      await mstr.mockRequest(url2PostParams, mockedResponse)

      expect(RequestMock).toHaveBeenCalledTimes(2)

      callParams = RequestMock.mock.calls[0]
      expect(callParams[0]).toBe(url1GetParams)
      expect(callParams[1]).toBe(mockedResponse)

      callParams = RequestMock.mock.calls[1]
      expect(callParams[0]).toBe(url2PostParams)
      expect(callParams[1]).toBe(mockedResponse)

      const pageContext = fakePages.values().next().value
      expect(pageContext.mocks.length).toBe(2)

      expect(pageContext.mocks[0]).toBe(RequestMock.mock.instances[0])
      expect(pageContext.mocks[1]).toBe(RequestMock.mock.instances[1])
    })
  })
})
