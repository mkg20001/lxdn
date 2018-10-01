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

/* conversion:

[ 'storage-pools',
  '<pool>',
  'volumes',
  '<type>',
  '<name>',
  'snapshots' ]

to

<Promise> api.storagePools(<String> pool).volumes(<String> type, <String> name).snapshots.get()

*/

function c (name) {
  return name.replace(/[<>]/gmi, '')
  /* name = name.replace(/[<>]/gmi, '')
  name = name.replace(/-([a-z])/gmi, (_, l) => l.toUpperCase())
  return name */
}

let restApi = out
let tree = {
  methods: {}
}

delete restApi['/']
delete restApi['/1.0/']
Object.keys(restApi).sort((a, b) => a.length - b.length).forEach(path => {
  const obj = restApi[path]
  let name = path.replace('/1.0/', '').split('/')
  for (const method in obj) { // eslint-disable-line guard-for-in
    const me = obj[method]
    let stack = name.slice(0).concat(method.toLowerCase())
    stack = stack.reduce((a, b) => {
      let la = a[a.length - 1]
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
      let el = stack.shift()
      let last = el.pop()
      let elId = el.join('.')
      let isLast = !stack.length
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

    /* stack.forEach(stackEl => {
      let el = stackEl.slice(0)
      let last = el.pop()
      let elId = el.join('.')
      if (!curTree[elId]) {
        if (last[0] === 'FIRE') {
          code.push(['addRestMethod', el, me])
        } else {
          code.push(['addParameterFunction', el, last])
        }
      } else {
        code.push(['cur = dlv', el])
      }
    }) */
  }
})

const dset = require('dset')

function iter (curTree, first) {
  let out = {}

  for (const mid in curTree.methods) { // eslint-disable-line guard-for-in
    let ms = mid.split('.')
    let md = curTree.methods[mid]

    let code = ''
    if (md.param) {
      code = `(...params) => {
        ${first ? 'let url = "/1.0/"' : ''}
        let pc = ${md.last.length}
        let p = ${JSON.stringify(md.last)}
        if (params.length < pc) {
          throw new Error('Missing parameter ' + p.slice(params.length).join(','))
        }
        url += ${ms.join('/')} + '/'

        return ${iter(md.methods)}
      }`
    } else {
      code = `(params) => {
        ${first ? 'let url = "/1.0/"' : ''}
        url += ${ms.join('/')} + '/'

        return client.request("${ms[ms.length - 1]}", url, ${JSON.stringify(md.me)})
      }`
    }

    dset(out, ms, code)
  }

  function oi (o) {
    let a = []
    for (const key in o) { // eslint-disable-line guard-for-in
      let v = JSON.stringify(key) + ':'
      if (typeof o[key] === 'object') {
        v += oi(o[key])
      } else {
        v += o[key]
      }
      a.push(v)
    }
    return '{' + a.join(',') + '}'
  }

  return oi(out)
}

console.log(iter(tree))
console.log(String(fs.readFileSync('./template.js')).replace('/* CODE */', iter(tree)))
