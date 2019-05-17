function from(params = '') {
  let result

  const defaults = {
    status: 200,
    contentType: 'application/json',
    body: ''
  }

  if (params instanceof Buffer) {
    result = Object.assign(defaults, { body: params })
  } else if (params && typeof params === 'object') {
    result = Object.assign(defaults, params)
  } else {
    result = Object.assign(defaults, { body: params })
  }

  const isABuffer = result.body instanceof Buffer
  if (!isABuffer) {
    const body = JSON.stringify(result.body)
    result.body = Buffer.from(body)
  }

  return result
}

module.exports = {
  from
}
