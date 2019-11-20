'use strict'

/* eslint-disable no-nested-ternary */
/* eslint-disable guard-for-in */

process.chdir(__dirname)

const fs = require('fs')
const content = String(fs.readFileSync('./rest-api.md'))
const data = content.split('## API details')[1].split('\n').filter(l => l.trim())

const parsed = []
let me
let subMe

// parse data

data.forEach(line => {
  const s = line.split(' ')
  switch (true) {
    case line.startsWith('### '): { // ### `/url`
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
    case line.startsWith('#### '): { // ### PATCH (ETag supported)
      subMe = me.methods[s[1]] = {
        name: s[1],
        comment: s.slice(2).join(' ').replace(/[()]/gmi, '') || null,
        meta: {}
      }
      break
    }
    case line.startsWith(' * ') && line.indexOf(':') !== -1: { // * Description: ...
      const name = s[2].toLowerCase().replace(':', '')
      subMe.meta[name] = s.slice(3).join(' ')
      break
    }
    case line.startsWith('* '): { //* Description: ...
      const name = s[1].toLowerCase().replace(':', '')
      subMe.meta[name] = s.slice(2).join(' ')
      break
    }
    default: {
      // do nothing
    }
  }
})

// turn parsed data into usable data

const out = {}
parsed.forEach(prop => {
  const propOut = {}

  for (const method in prop.methods) { // eslint-disable-line guard-for-in
    const me = prop.methods[method]
    const meOut = propOut[method] = {}
    if (me.comment) {
      meOut.comment = me.comment
    }

    me.meta.authentication = me.meta.authentication.replace(' or ', ', ').split(', ')

    if (me.meta.operation === 'N/A') {
      delete me.meta.operation
      me.meta.rawCall = true
    } else {
      if (me.meta.operation.indexOf('(') !== -1) {
        me.meta.operation_comment = me.meta.operation.replace(/.+\(/gmi, '').replace(/[()]/gmi, '')
      }
      me.meta.operation = me.meta.operation.replace(/ *\(.+/gmi, '').replace(' or ', ', ').toLowerCase().split(', ')
    }

    if (me.meta.introduced) {
      me.meta.extension = me.meta.introduced.match(/api extension `([a-z_]+)`/mi)[1]
      delete me.meta.introduced
    }

    for (const k in me.meta) { // eslint-disable-line guard-for-in
      meOut[k] = me.meta[k]
    }
  }
  out[prop.name] = propOut
})

fs.writeFileSync('./rest-api.json', JSON.stringify(out, null, 2))

/* conversion:

  [ 'storage-pools',
    '<pool>',
    'volumes',
    '<type>',
    '<name>',
    'snapshots' ]
      -> <Promise> api.storagePools(<String> pool).volumes(<String> type, <String> name).snapshots.get()

*/

function c (name) {
  return name.replace(/[<>]/gmi, '')
}

const restApi = out
const tree = {
  methods: {}
}

delete restApi['/']
restApi['/1.0/info'] = restApi['/1.0/'] // map this to .info()
delete restApi['/1.0/']

// convert into method-tree

Object.keys(restApi).sort((a, b) => a.length - b.length)/* sort by length so low-level stuff goes first */.forEach(path => {
  const obj = restApi[path]
  const name = path.replace('/1.0/', '').split('/')
  for (const method in obj) { // eslint-disable-line guard-for-in
    const me = obj[method]
    let stack = name.slice(0).concat(method.toLowerCase())
    stack = stack.reduce((a, b) => {
      const la = a[a.length - 1]
      if (Array.isArray(la[la.length - 1])) { // is function, accepts only params
        if (b.startsWith('<')) {
          la[la.length - 1].push(c(b))
        } else {
          a.push([c(b)])
        }
      } else if (b.startsWith('<')) {
        la.push([c(b)])
      } else {
        la.push(c(b))
      }

      return a
    }, [[]])

    stack[stack.length - 1].push(['FIRE']) // so method is a function and knows what to do

    let curTree = tree

    while (stack.length) {
      const el = stack.shift()
      const last = el.pop()
      const elId = el.join('.')
      const isLast = !stack.length
      if (!curTree.methods) {
        curTree.methods = {}
      }
      if (isLast) {
        curTree.methods[elId] = {
          last,
          me
        }
      }
      curTree = tree.methods[elId]
      if (!curTree && !isLast) {
        curTree = tree.methods[elId] = {
          last,
          param: true
        }
      }
    }
  }
})

// convert tree into code

const dset = require('dset')

function iter (curTree, l) {
  const outD = {}
  const outF = {}

  for (const methodID in curTree.methods) { // eslint-disable-line guard-for-in
    const methodData = curTree.methods[methodID]

    const ms = methodID.split('.')
    const msFull = ms.slice(0)
    let httpVerb

    if (!methodData.param) {
      httpVerb = ms.pop().toUpperCase()
    }

    const msCode = msFull.map(s => s.replace(/-([a-z])/, (_, l) => l.toUpperCase()))

    if (methodData.param) {
      dset(outF, msCode, `(...params) => {
        ${!l ? `let u0 = "/1.0/${ms.join('/')}/"` : `let u${l} = u${l - 1} + "${ms.join('/')}/"`}
        let pc = ${methodData.last.length}
        let p = ${JSON.stringify(methodData.last)}
        if (params.length < pc) {
          throw new Error('Missing parameter ' + p.slice(params.length).join(','))
        }
        if (params.length > pc) {
          throw new Error('Too many parameters')
        }
        u${l} += params.join('/') + '/'

        return ${iter(methodData, l + 1)}
      }`)
    } else {
      dset(outD, msCode, `(params, queryParams, headers) => {
        ${!l ? `let u0 = "/1.0/${ms.join('/')}/"` : (ms.length ? `let u${l} = u${l - 1} + "${ms.join('/')}/"` : `let u${l} = u${l - 1}`)}

        return client.request("${httpVerb}", u${l}, ${JSON.stringify(methodData.me)}, params, queryParams, headers)
      }`)
    }
  }

  function functionObjectStringify (o) { // stringifies as object with strings treated as literal code
    const a = []
    for (const key in o) { // eslint-disable-line guard-for-in
      let v = JSON.stringify(key) + ':'
      if (typeof o[key] === 'object') {
        v += functionObjectStringify(o[key])
      } else {
        v += o[key]
      }
      a.push(v)
    }
    return '{' + a.join(',') + '}'
  }

  return 'merge(' + [outF, outD].map(functionObjectStringify).join(', ') + ')'
}

// beautify & minify code
const code = require('terser').minify(String(fs.readFileSync('./template.js')).replace('/* CODE */', iter(tree, 0)), { output: { beautify: true } })
if (code.error) {
  throw code.error
}

// and save
fs.writeFileSync('../src/api.js', code.code)
