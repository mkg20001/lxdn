'use strict'

const dset = require('dset')

function merge(obj1, obj2, path) {
  if (!path) {
    path = []
  }
  for (const key in obj2) {
    if (typeof obj2[key] === 'object') {
      merge(obj1, obj2[key], path.concat([key]))
    } else {
      dset(obj1, path.concat([key]), obj2[key])
    }
  }

  return obj1
}

module.exports = (client) => (/* CODE */)
