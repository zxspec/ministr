class Context {
  constructor() {
    this.chain = null
    this.browser = null
    this.page = null
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
}

module.exports = Context
