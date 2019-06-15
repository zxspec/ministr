class Context {
  constructor() {
    this.chain = null
    this.browser = null
    this.page = null
    this.pages = new Map()
    this.baseUrl = null
  }

  extendChain(payload) {
    if (!this.chain) {
      this.chain = Promise.resolve()
    }

    this.chain = this.chain.then(async () => {
      await payload()
    })

    return this.chain
  }

  setBaseUrl(url) {
    this.baseUrl = new URL('', url)
  }
}

module.exports = Context
