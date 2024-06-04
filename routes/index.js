const router = require('express').Router()

function errRoute(err, req, res, next){
    res.status(err.status || 500).json({
        code: err.code || 500,
        status: false,
        message: err.message || 'Internal Server Error'
    })
}

module.exports = {router, errRoute}