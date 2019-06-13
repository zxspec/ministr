const responseMock = require('./responseMock')

class RequestMock {
  constructor(requestParams, response) {
    this.requestParams = requestParams

    const isResponseList =
      Array.isArray(response) &&
      response.length &&
      response.every(responseMock.isResponseLikeObject)

    if (isResponseList) {
      this.response = response.map(r => responseMock.from(r))
    } else {
      this.response = [responseMock.from(response)]
    }
  }

  match(req) {
    const url = this.requestParams.url
    const urlParamType = typeof url

    const method = this.requestParams.method || 'GET'
    const isMethodMatch = method === req.method()

    if (urlParamType === 'string') {
      return isMethodMatch && url === req.url()
    } else if (this.requestParams.url instanceof RegExp) {
      const isUrlMatch = this.requestParams.url.test(req.url())
      return isMethodMatch && isUrlMatch
    }

    return false
  }

  getResponse() {
    if (this.response.length > 1) {
      return this.response.shift()
    }
    return this.response[0]
  }
}

module.exports = RequestMock
