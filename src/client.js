'use strict'

const debug = require('debug')
const log = debug('lxdn')

let ReqID = 0
const fetch = require('node-fetch')

const createApi = require('./api')

class Client {
  constructor (host, auth) {
    log('creating client for %s', host || '<local>')

    let protocol, hostname, port
    if (host) {
      const hostUrl = URL.parse(host)
      protocol = hostUrl.protocol
      hostname = hostUrl.hostname
      port = hostUrl.port
    }

    // local
    this.isLocal = host === undefined

    // path
    if (host) {
      this.address = protocol + '//' + hostname
      if (port) {
        this.address += ':' + port
      }
    } else {
      this.address = 'http://unix:/var/lib/lxd/unix.socket:'
    }

    // websocket path
    if (host) {
      this.wsAddress = 'ws://' + hostname + (port ? ':' + 'port' : '') + '/'
    } else {
      this.wsAddress = 'ws+unix:///var/lib/lxd/unix.socket:'
    }

    if (auth && auth.cert && auth.key) {
      this.auth = auth
    }

    this.api = createApi(this)
  }

  e (e, resp, isLXDError) {
    e.lxdHost = this.address
    e.response = resp.type
    e.metadata = resp.metadata

    if (isLXDError) {
      e.error_code = resp.error_code
    } else {
      e.status_code = resp.status_code
    }

    return e
  }

  async request (method, url, apiDesc, params) {
    const reqId = ++ReqID

    const options = {} // TODO: rejectUnauthorized false and cert auth

    if (method !== 'GET') {
      options.method = method
      options.body = params
    }

    url = this.address + url.replace(/\/$/, '')

    let resp = await fetch(url, options)
    resp = await resp.json() // TODO: raw value calls

    if (resp.type !== 'error' && apiDesc.operation.indexOf(resp.type) === -1) {
      throw this.e(new Error('Spec violation: Should only return ' + apiDesc.operation), resp)
    }

    switch (resp.type) {
      case 'error': {
        throw this.e(new Error('LXD Error: ' + resp.error), resp, true)
      }
      case 'sync': {
        return resp.metadata
      }
      // TODO: async
      default: {
        throw new TypeError('Unknown response type ' + resp.type)
      }
    }
  }
}

module.exports = Client
