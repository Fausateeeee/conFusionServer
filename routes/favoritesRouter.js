const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')
const Favorites = require('../models/favorites')
const favoritesRouter = express.Router()
const cors = require('./cors')

favoritesRouter.use(bodyParser.json())

favoritesRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id }).populate('dishes').populate('user')
      .then((favorites) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
      }, (err) => next(err)).catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites !== null) {
          for (const dish of req.body) {
            if (!favorites.dishes.find((dishId) => dishId.equals(dish._id))) {
              favorites.dishes.push(dish)
            }
          }
          favorites.save()
            .then((favorite) => {
              Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
              })
            })
        } else {
          Favorites.create({ user: req.user._id })
            .then((favorites) => {
              for (const dish of req.body) {
                favorites.dishes.push(dish)
              }
              favorites.save().then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(favorite)
                })
              })
            })
        }
      }, (err) => next(err)).catch((err) => next(err))
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then((resp) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
      }, (err) => next(err))
      .catch((err) => next(err))
  })

favoritesRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (!favorites) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          return res.json({ exists: false, favorites: favorites })
        } else {
          if (favorites.dishes.indexOf(req.params.dishId) < 0) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            return res.json({ exists: false, favorites: favorites })
          } else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            return res.json({ exists: true, favorites: favorites })
          }
        }
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          if (!favorites.dishes.find((dishId) => dishId.equals(req.params.dishId))) {
            favorites.dishes.push(req.params.dishId)
          }
          favorites.save()
            .then((favorite) => {
              Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
              })
            })
        } else {
          Favorites.create({ user: req.user._id })
            .then((favorites) => {
              favorites.dishes.push(req.params.dishId)
              favorites.save().then((favorite) => {
                Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.json(favorite)
                })
              })
            })
        }
      })
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        console.log(favorites)
        if (favorites) {
          if (favorites.dishes.find((dishId) => dishId.equals(req.params.dishId))) {
            favorites.dishes.splice(favorites.dishes.indexOf(req.params.dishId), 1)
            favorites.save().then((favorite) => {
              Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite)
              })
            })
          } else {
            const err = new Error(`The favorite dish ${req.params.dishId} is not found`)
            err.status = 404
            return next(err)
          }
        } else if (favorites === null) {
          const err = new Error('The user has no favorites')
          err.status = 404
          return next(err)
        }
      })
  })
module.exports = favoritesRouter
