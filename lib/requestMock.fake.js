const url1 = 'https://www.example.com'
const url2 = 'https://www.example.net'

const url1GetParams = {
  method: 'GET',
  url: url1
}

const url2GetParams = {
  method: 'GET',
  url: url2
}

const url1PostParams = {
  method: 'POST',
  url: url1
}

const url2PostParams = {
  method: 'POST',
  url: url2
}

const regex1GetParams = {
  method: 'GET',
  url: /example.com$/
}

const regex2GetParams = {
  method: 'GET',
  url: /example.net$/
}

const regex1PostParams = {
  method: 'POST',
  url: /example.com$/
}

const regex2PostParams = {
  method: 'POST',
  url: /example.net$/
}

const fakeUrl1GetRequest = {
  url: () => url1,
  method: () => 'GET',
  respond: jest.fn(),
  continue: jest.fn()
}

const fakeUrl2PostRequest = {
  url: () => url2,
  method: () => 'POST',
  respond: jest.fn(),
  continue: jest.fn()
}

module.exports = {
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
}
