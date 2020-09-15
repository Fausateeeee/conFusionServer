const express = require('express')
const cors = require('cors')

// Allowed origins
const whiteList = ['http://localhost:3000', 'https://localhost:3443', 'http://fausateeeee-MS-7971:3001', 'http://localhost:3001']
var corsOptionsDelegate = (req, callback) => {
  var corsOptions

  if (whiteList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }
  } else {
    corsOptions = { origin: false }
  }

  callback(null, corsOptions)
}

exports.cors = cors()
exports.corsWithOptions = cors(corsOptionsDelegate)
