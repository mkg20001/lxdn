'use strict'

const debug = require('debug')
const log = debug('lxdn')

const crypto = require('crypto')
const getReqId = () => crypto.randomBytes('2').toString('hex')
const fetch = require('node-fetch')

const createApi = require('./api')

class Client {
  constructor (host, authenticate) {
    log('creating client for %s', host || '<local>')

    let protocol, hostname, port
    if (host) {
      var hostUrl = URL.parse(host)
      protocol = hostUrl.protocol
      hostname = hostUrl.hostname
      port = hostUrl.port
    }

    // local
    this._local = host === undefined

    // path
    if (host) {
      this._path = protocol + '//' + hostname
      this._path += port ? ':' + port + '/' : '/'
    } else {
      this._path = 'http://unix:/var/lib/lxd/unix.socket:/'
    }

    // websocket path
    if (host) {
      this._wsPath = 'ws://' + hostname + (port ? ':' + 'port' : '') + '/'
    } else {
      this._wsPath = 'ws+unix:///var/lib/lxd/unix.socket:/'
    }

    if (authenticate && authenticate.cert && authenticate.key) {
      this._cert = authenticate.cert
      this._key = authenticate.key
    }

    this.api = createApi(client)
  }

  request () {

  }
}

module.exports = Client
