const UserModel = require('../models/user.model')

const baseController = require('./base.controller')
const TokenManager = require("../utils/tokenManager")
const mysqlErrHandler = require('../utils/MysqlErrorCode')
const model = new UserModel()
const logging = require('../config').logging
const CustomError = require('../utils/CustomError')

/**
 * Fonction for rotate or renew JWT Token
 */
async function rotateToken(req, res, next, cookies = setCookies, secret = process.env.REFRESH_TOKEN_SECRET){
    try {
        // go to next middleware if error occured
        if(req.result?.status === false) return next()

        // get refreshToken from header
        const refreshToken = req?.cookies?.refreshToken
        if(!refreshToken) throw new CustomError('ER_INVALID_TOKEN')

        // validate token and get payload
        const payload = await TokenManager.verifyToken(refreshToken, secret)
        if(!payload) throw new CustomError('ER_EXPIRED_TOKEN')

        // rotate tokens
        const tokens = await TokenManager.authenticatedUser(payload)
        if(!tokens || Object.keys(tokens) < 1) throw new CustomError('ER_INVALID_TOKEN')
        
        // send token as Http-only cookies
        cookies(res, tokens)
        
        return next()

    } catch (error) {
        if(logging) console.error(error)
        req.result = mysqlErrHandler(error)
        return next()
    }
}
/**
 * function for authenticate user credential like username and password
 */
async function authenticateUser(){

}
/**
 * function for authorize user using JWT Token
 */
async function authorizeUser(){

}
/**
 * Function for handling user login using 
 * authorizeUser (JWT Token) or authenticateUser (user credential)
 */
async function login(){

}
/**
 * Function for deauthenticate user by revoke token from client side cookies
 */
async function logout(){

}
/**
 * Function for create new user
 */
async function register(){

}
/**
 * Function for retrieve user information
 */
async function profile(){

}

function setCookies(res, tokens) {
    Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
        res.cookie(tokenName, tokenValue, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })
    })
}

module.exports = {
    rotateToken
}
