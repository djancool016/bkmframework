require('dotenv').config()
const util = require('util')
const logging = require('../config').logging

const jwt = require('jsonwebtoken')
const signAsync = util.promisify(jwt.sign)
const verifyAsync = util.promisify(jwt.verify)

/**
 * Generate and verify token for user authorization
 */
class TokenManager {
    /**
     * @param {Object} payload contains user data
     * @param {String} secret token secret from env file
     * @param {Number} expiresIn token expiration in second (default = 3600)
     * @returns string token
     */
    static async generateToken(payload, secret, expiresIn = 36000) {
        try {
            if(!payload || Object.keys(payload).length < 1) throw new Error('empty payload')
            if(!secret) throw new Error('empty signature')
            return await signAsync(payload, secret, { expiresIn })

        } catch (error) {
            if(logging) console.error(error)
            throw error
        }
    }
    /**
     * @param {String} token token for verification
     * @param {String} secret token secret from env file
     * @returns Promises contains payload
     */
    static async verifyToken(token, secret) {
        try {
            if(!token) throw new Error('empty token')
            if(!secret) throw new Error('empty signature')
            return await verifyAsync(token, secret)

        } catch (error) {
            if(logging) console.error(error)
            throw error
        }
    }
    /**
     * @param {Object} payload contains client data { id, username }
     * @param {Number} refreshTokenExpiration refresh token expiration in second (default = 86400)
     * @param {Number} accessTokenExpiration access token expiration in second (default = 3600)
     * @returns refreshToken & accessToken
     */
    static async authenticatedUser({id, username}, refreshTokenExpiration = 86400, accessTokenExpiration = 3600) {
        try {
            const refreshToken = await TokenManager.generateToken(
                {id}, process.env.REFRESH_TOKEN_SECRET, refreshTokenExpiration
            )
                
            const accessToken = await TokenManager.generateToken(
                {id, username}, process.env.ACCESS_TOKEN_SECRET, accessTokenExpiration
            )
            
            return {refreshToken, accessToken}

        } catch (error) {
            if(logging) console.error(error)
            throw error
        }
    }
    
    /**
     * @param {String} accessToken require valid access token
     * @param {Number} refreshTokenExpiration refresh token expiration in second (default = 86400)
     * @param {Number} accessTokenExpiration access token expiration in second (default = 3600)
     * @returns new accessToken & refreshToken
     */
    static async tokenRotation(accessToken, refreshTokenExpiration = 86400, accessTokenExpiration = 3600) {
        try {

            const {id, username} = await TokenManager.verifyToken(
                accessToken, process.env.ACCESS_TOKEN_SECRET
            )

            if(!id || !username) throw new Error('Invalid access token')

            return await TokenManager.authenticatedUser(
                {id, username}, refreshTokenExpiration, accessTokenExpiration
            )

        } catch (error) {
            if(logging) console.error(error)
            throw new Error('Token rotation error: ' + error)
        }
    }
}

module.exports = TokenManager
