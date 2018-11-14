'use strict'

const debug = require('debug')
const log = debug('lxdn')

let ReqID = 0
const fetch = require('node-fetch')

const createApi = require('./api')

class AsyncOperation {
  constructor (client, opUrl, data) {
    this.client = client
    this.operation = client.api.operations(data.id)
    this.id = data.id
    this.opUrl = opUrl
    this.isAsync = true

    this.handleResp(data)
    this.verifySuccess()
  }
  handleResp (data) {
    this.opClass = data.class
    this.createdAt = Date.parse(data.created_at)
    this.updatedAt = Date.parse(data.updated_at)
    this.status = data.status
    this.statusCode = data.status_code
    this.resources = data.resources
    this.metadata = data.metadata
    this.mayCancel = data.may_cancel
    this.err = data.err
  }

  async refresh () {
    let data = await this.operation.get()
    this.handleResp(data)
    return data
  }

  async cancel () {
    if (this.mayCancel && this.stillRunning) {
      await this.operation.delete()
      this.refresh()
    } else {
      throw new Error('Failed to cancel: Operation ' + (this.mayCancel ? 'cannot be canceled' : 'already completed'))
    }
  }

  async wait (timeout) {
    let data = await this.operation.wait.get(null, timeout ? {timeout} : null)
    this.handleResp(data)
    this.verifySuccess()
    return data
  }

  async websocket () {
    let url = this.client.wsAddress + '/1.0/operations/' + this.id + '/websocket?secret=' + this.metadata.secret
    // TODO: establish websocket connection
  }

  verifySuccess () {
    if (this.err) {
      throw new Error('Operation failure: ' + this.err)
    }
  }
}

class Client {
  constructor (host, auth) {
    log('creating client for %s', host || '<local>')

    let protocol, hostname, port

    // local
    let useSocket = this.isLocal = host === undefined || host.startsWith('/')

    if (!useSocket) {
      const hostUrl = new URL(host)
      protocol = hostUrl.protocol
      hostname = hostUrl.hostname
      port = hostUrl.port
    }

    // path
    if (!useSocket) {
      this.address = protocol + '//' + hostname
      if (port) {
        this.address += ':' + port
      }
    } else {
      if (!host) {
        host = '/var/lib/lxd/unix.socket'
      }

      this.address = 'http://unix:' + host + ':'
    }

    // websocket path
    if (!useSocket) {
      this.wsAddress = 'ws://' + hostname + (port ? ':' + 'port' : '') + '/'
    } else {
      this.wsAddress = 'ws+unix://' + host + ':'
    }

    if (auth && auth.cert && auth.key) {
      this.auth = auth
    }

    this.api = createApi(this)
  }

  e (e, req, resp, isLXDError) {
    e.lxdHost = this.address
    if (resp) {
      e.response = resp.type
      e.metadata = resp.metadata
    }
    e.req = req

    e.stack += `\n --- LXD ---\n ${req.method} ${req.url} \n ${JSON.stringify(req.params)} \n Response: ${resp.type} \n Metadata: ${JSON.stringify(resp.metadata)} `

    if (isLXDError) {
      e.error_code = resp.error_code
      e.stack += `\n Error: ${resp.error_code} ${resp.error} `
    } else if (resp) {
      e.status_code = resp.status_code
      e.status += `\n Status: ${resp.status_code} ${resp.status} `
    }

    e.stack += `\n --- LXD ---`

    return e
  }

  async connect () {
    this.info = { // stub so client 'works'
      authentication: 'guest',
      api_extensions: []
    }
    let p = this.api.info.get()
    this.info.wait = p // makes client wait for connection
    this.info = await p
    log('connected')
  }

  async request (method, url, apiDesc, params, queryParams, headers) {
    if (!this.info) {
      await this.connect()
    }
    if (this.info.wait) {
      await this.info.wait
    }

    const reqId = ++ReqID

    if (!headers) {
      headers = {}
    }

    const options = {headers, rejectUnauthorized: false}
    if (this.auth) {
      options.cert = this.auth.cert
      options.key = this.auth.key
    }

    if (method !== 'GET') {
      options.method = method
      options.body = JSON.stringify(params)
    }

    if (url === '/1.0/info/') {
      url = '/1.0/'
    }

    url = url.replace(/\/$/, '')

    if (queryParams) {
      url += '?' + String(new URLSearchParams(queryParams))
    }

    log('[req#%i]: %s %s %o', reqId, method, url, params)

    let req = {method, url, params}

    if (apiDesc.extension && this.info.api_extensions.indexOf(apiDesc.extension) === -1) {
      throw this.e(new Error('API call ' + url + ' requires extension ' + apiDesc.extension + ' which the server doesn\'t support!'), req)
    }

    url = this.address + url

    let resp = await fetch(url, options)

    if (apiDesc.rawCall) { // raw calls
      if (resp.status >= 400) {
        resp = {
          type: 'error',
          error: resp.statusText,
          error_code: resp.status,
          metadata: {}
        }
        /* continue with json part, handle as error */
      } else {
        resp = await resp.buffer()
        return resp
      }
    } else {
      resp = await resp.json() // parse as json
    }

    log('[res#%i]: got %s', reqId, resp.type)

    if (resp.type !== 'error' && apiDesc.operation.indexOf(resp.type) === -1) {
      throw this.e(new Error('Spec violation: Should only return ' + apiDesc.operation), req, resp)
    }

    switch (resp.type) {
      case 'error': {
        throw this.e(new Error('LXD Error: ' + resp.error), req, resp, true)
      }
      case 'sync': {
        return resp.metadata
      }
      case 'async': {
        return new AsyncOperation(this, resp.operation, resp.metadata)
      }
      default: {
        throw new TypeError('Unknown response type ' + resp.type)
      }
    }
  }
}

module.exports = Client
