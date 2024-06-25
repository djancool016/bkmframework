const UserModel = require('../models/user.model')
const TokenManager = require("../utils/tokenManager")
const mysqlErrHandler = require('../utils/MysqlErrorCode')
const logging = require('../config').logging
const CustomError = require('../utils/CustomError')
const {dataLogger} = require('../utils/HttpLogger')
const tokenSecret = {
    accessToken: process.env.ACCESS_TOKEN_SECRET,
    refreshToken: process.env.REFRESH_TOKEN_SECRET
}

/**
 * Fonction for rotate or renew JWT Token
 */
async function rotateToken(req, res, next, cookies = setCookies, secret = tokenSecret){
    try {
        // go to next middleware if error occured
        if(req.result?.status === false) return next()

        // get refreshToken from header
        const {refreshToken} = isTokenExist(req)

        // validate token and get payload
        const payload = await validateToken(refreshToken, secret.refreshToken)

        // rotate tokens
        const tokens = await handleTokenRotation(payload, secret.refreshToken)
        
        // send token as Http-only cookies
        cookies(res, tokens)
        
        return next()

    } catch (error) {
        if(logging) console.error(error)
        if(error.message == 'jwt malformed'){
            error['code'] = 'ER_JWT_MALFORMED'
        }
        req.result = mysqlErrHandler(error)
        return next()
    }
}
/**
 * function for authorize user using JWT Token
 */
async function authorizeUser(req, res, next, cookies = setCookies, secret = tokenSecret
){
    try {
        // check if token exist
        const{refreshToken, accessToken} = isTokenExist(req)

        // get payload data
        let payload = await validateToken(accessToken, secret.accessToken)
        let user

        // validate payload data
        if(payload) {
            user = await getUserData(payload)
        }else{
            await rotateToken(req, res, next, cookies, secret)
            user = await getUserData(payload)
        }

        if(!user.data) throw new CustomError('ER_NOT_FOUND')
        
        // add user data into request payload
        const {password, ...rest} = user.data[0]
        req.result = dataLogger({data: rest})

        // run next middleware
        return next()

        // returning validated payload data

    } catch (error) {
        if(logging) console.error(error)
        req.result = mysqlErrHandler(error)
        return next()
    }
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

function isTokenExist(req){
    const refreshToken = req?.cookies?.refreshToken
    const accessToken = req?.cookies?.refreshToken
    if(!refreshToken || !accessToken){
        throw new CustomError('ER_JWT_NOT_FOUND')
    }else{
        return {refreshToken, accessToken}
    }
}
async function handleTokenRotation(payload, secret){
    const tokens = await TokenManager.authenticatedUser(payload, secret)
    if (tokens && tokens.refreshToken && tokens.accessToken) {
        return tokens
    } else {
        throw new CustomError('ER_INVALID_TOKEN')
    }
}
async function validateToken(token, secret){
    // validate token and get payload
    const payload = await TokenManager.verifyToken(token, secret)
    if(payload) return payload
}

async function getUserData(payload) {
    const model = new UserModel()
    const user = await model.findByPk(payload.id)
    if (user) return user
    throw new CustomError('ER_JWT_PAYLOAD_INVALID')
}
module.exports = {
    rotateToken, authorizeUser
}

