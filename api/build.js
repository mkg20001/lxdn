'use strict'

const fs = require('fs')
const content = String(fs.readFileSync('./rest-api.md'))
let data = content.split('# API details')[1].split('\n').filter(l => l.trim())

let parsed = []
let me
let subMe
data.forEach(line => {
  let s = line.split(' ')
  switch (true) {
    case line.startsWith('## '): {
      // ## `/url`, new method
      if (me) {
        parsed.push(me)
      }
      subMe = null
      me = {
        name: s[1].replace(/`/g, ''),
        methods: {}
      }
      break
    }
    case line.startsWith('### '): { // ### PATCH (ETag supported)
      subMe = me.methods[s[1]] = {
        name: s[1],
        comment: s.slice(2).join(' ').replace(/[()]/gmi, '') || null,
        meta: {}
      }
      break
    }
    case line.startsWith(' * '): { // * Description: ...
      let name = s[2].toLowerCase().replace(':', '')
      subMe.meta[name] = s.slice(3).join(' ')
      break
    }
    case line.startsWith('* '): { //* Description: ...
      let name = s[1].toLowerCase().replace(':', '')
      subMe.meta[name] = s.slice(2).join(' ')
      break
    }
    default: {
      // do nothing
    }
  }
})

// console.log(require('util').inspect(parsed, {depth: null, colors: true}))

let out = {}
parsed.forEach(prop => {
  const propOut = {}

  for (const method in prop.methods) { // eslint-disable-line guard-for-in
    const me = prop.methods[method]
    const meOut = propOut[method] = {}
    if (me.comment) {
      meOut.comment = me.comment
    }
    me.meta.authentication = me.meta.authentication.split(' or ')
    if (me.meta.operation === 'N/A') {
      delete me.meta.operation
    }

    /*

    TO DO
      - more data extraction
        - meta.introduced: with API extension `$EXTENSION`
          - could be mapped to ".extension"
        - operation: OP or OP2 (COMMENT)
          - make operation array, add operation_comment or operation_desc

    */

    for (const k in me.meta) { // eslint-disable-line guard-for-in
      meOut[k] = me.meta[k]
    }
  }
  out[prop.name] = propOut
})

// console.log(require('util').inspect(out, {depth: null, colors: true}))

fs.writeFileSync('./rest-api.json', JSON.stringify(out, null, 2))
