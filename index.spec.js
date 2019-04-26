const puppeteer = require('puppeteer')
const EventEmitter = require('events')
const ministr = require('./index')
const utils = require('./lib/utils')
const url = 'https://www.example.com'
const url2 = 'https://www.example.org'

const options = {
  headless: true,
  devtools: false
}

describe('ministr', () => {
  let mstr
  let fakePage
  let fakeBrowser

  beforeEach(() => {
    jest.spyOn(utils, 'createPageIfMissing')
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

    mstr = ministr(options, {
      browser: null,
      page: null
    })
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
      await mstr.visit(url)
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
      await mstr.visit(url)
      expect(utils.createPageIfMissing).toHaveBeenCalled()
    })

    it('should not re-create page if page already exist', async () => {
      await mstr.visit(url).visit(url2)
      expect(fakeBrowser.newPage).toHaveBeenCalledTimes(1)
    })

    it('should load page for provided URL', async () => {
      await mstr.visit(url)
      expect(fakePage.goto).toHaveBeenCalledTimes(1)
      expect(fakePage.goto).toHaveBeenCalledWith(url)
    })

    describe('options', () => {
      it('should use "auth" option for basic authentication', async () => {
        const optionsWithAuth = { auth: {} }
        await mstr.visit(url, optionsWithAuth)

        expect(fakePage.authenticate).toHaveBeenCalledTimes(1)
        expect(fakePage.authenticate).toHaveBeenCalledWith(optionsWithAuth.auth)

        expect(fakePage.goto).toHaveBeenCalledTimes(1)
        expect(fakePage.goto).toHaveBeenCalledWith(url)
      })
    })
  })

  describe('setCookie()', () => {
    const fakeCookie = {
      name: 'x-test',
      value: 'test',
      url
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
    let fakeRequest

    const mockParams = {
      method: 'POST',
      url: /example.com$/
    }
    const mockParamsWithoutMethod = { url: /example.com$/ }
    const mockNotMatchingUrl = { url: /example.net$/ }

    const mockedResponse = []

    beforeEach(() => {
      fakeRequest = {
        url: () => url,
        method: () => 'POST',
        respond: jest.fn(),
        continue: jest.fn()
      }
      fakeGetRequest = {
        url: () => url,
        method: () => 'GET',
        respond: jest.fn(),
        continue: jest.fn()
      }
    })

    it('should create a new page if it does not exists', async () => {
      await mstr.mockRequest(mockParams)
      expect(utils.createPageIfMissing).toHaveBeenCalled()
    })

    it('should enable request interception', async () => {
      await mstr.mockRequest(mockParams, mockedResponse)
      expect(fakePage.setRequestInterception).toHaveBeenCalledTimes(1)
      expect(fakePage.setRequestInterception).toHaveBeenCalledWith(true)
    })

    it('should return mocked response when request url and http-method match parameters', async () => {
      await mstr.mockRequest(mockParams, mockedResponse)

      fakePage.emit('request', fakeRequest)

      expect(fakeRequest.respond).toHaveBeenCalledTimes(1)
      expect(fakeRequest.respond).toHaveBeenCalledWith(mockedResponse)
    })

    it('should return mocked response when request url and http-method match parameters', async () => {
      await mstr.mockRequest(mockParamsWithoutMethod, mockedResponse)

      fakePage.emit('request', fakeGetRequest)

      expect(fakeGetRequest.respond).toHaveBeenCalledTimes(1)
      expect(fakeGetRequest.respond).toHaveBeenCalledWith(mockedResponse)
    })

    it('should not mock request when url does not match', async () => {
      await mstr.mockRequest(mockNotMatchingUrl, mockedResponse)

      fakePage.emit('request', fakeRequest)

      expect(fakeRequest.continue).toHaveBeenCalledTimes(1)
    })
  })
})
