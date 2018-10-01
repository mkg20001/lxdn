'use strict'

const Client = require('./client')

/**
 * Creates a new client at the specified host, if none
 * is provided the client will use the local domain socket.
 * @param {string?} host
 * @param {object?} authentication
 * @param {string?} authentication.cert
 * @param {string?} authentication.key
 * @param {string?} authentication.password
 * @returns {Client}
 */
function createClient (host, authentication) {
  return new Client(host, authentication)
}

module.exports = createClient
