require('dotenv').config()
const util = require('util')

const bcrypt = require('bcrypt')
const genSalt = util.promisify(bcrypt.genSalt)
const hash = util.promisify(bcrypt.hash)
const compare = util.promisify(bcrypt.compare)

/**
 * PasswordManager class for hashing password and compare password with hashed password
 */
class PasswordManager {

    /**
     * @param {String} password user input password
     * @param {Number} saltRounds rounds for hashing password, default = 10
     * @returns hashed password
     */
    static async encrypt({password, saltRounds = 10}){

        // check password
        if(!password) throw new Error('Invalid password')

        // hashing password
        const salt = await genSalt(saltRounds)
        const hashedPassword = await hash(`${password}`, salt)
        if(!hashedPassword) throw new Error('Password hashing error')

        // returning hashed password
        return hashedPassword
    }
    /**
     * @param {String} password user input password
     * @param {String} hashedPassword hashed password from database
     * @returns Boolean
     */
    static async compare({password, hashedPassword}){

        // compare password
        const result = await compare(`${password}`, hashedPassword)
        if(!result) throw new Error('Invalid password')
        
        // returning true
        return result
    }
}

module.exports = PasswordManager