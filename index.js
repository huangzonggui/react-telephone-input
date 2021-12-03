
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-telephone-input.cjs.production.min.js')
} else {
  module.exports = require('./react-telephone-input.cjs.development.js')
}
