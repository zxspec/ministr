const defaults = {
  status: 200,
  contentType: 'application/json',
  body: ''
}

function from(params = '') {
  let result

  if (isResponseLikeObject(params)) {
    result = { ...defaults, ...params }
  } else {
    result = { ...defaults, ...{ body: params } }
  }

  const isBuffer = result.body instanceof Buffer
  if (!isBuffer) {
    const body = JSON.stringify(result.body)
    result.body = Buffer.from(body)
  }

  return result
}

function isResponseLikeObject(val) {
  if (val instanceof Buffer) {
    return false
  }

  if (val && typeof val === 'object') {
    return 'body' in val || 'status' in val || 'contentType' in val
  }

  return false
}

module.exports = {
  from,
  isResponseLikeObject
}
