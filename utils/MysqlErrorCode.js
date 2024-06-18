const {statusLogger} = require('./HttpLogger')
const logging = require('../config').logging

function mysqlErrCode(error){
    try {
        switch(error.code){
            case 'ER_ACCESS_DENIED_ERROR':
                return statusLogger({code: 403})
            case 'ER_INVALID_TOKEN':
                return statusLogger({code: 403, message: 'Invalid Token'})
            case 'ER_EXPIRED_TOKEN':
                return statusLogger({code: 403, message: 'Expired Token'})
            case 'ER_INVALID_CREDENTIAL':
                return statusLogger({code: 403, message: 'Invalid Credentials'})
            case 'ER_NO_TOKEN':
                return statusLogger({code: 403, message: 'No user token found'})
            case 'ER_BAD_DB_ERROR':
                return statusLogger({code: 404})
            case 'ER_NOT_FOUND':
                return statusLogger({code: 404})
            case 'ER_DUP_ENTRY':
                return statusLogger({code: 409, message: error.message})
            case 'ER_NO_SUCH_TABLE':
                return statusLogger({code: 404, message: error.message})
            case 'ER_NO_DATA':
                return statusLogger({code: 404, message: error.message})
            case 'ER_PARSE_ERROR':
                return statusLogger({code: 400, message: error.message})
            case 'ER_INVALID_BODY':
                return statusLogger({code: 400, message: error.message})
            case 'ER_BAD_FIELD_ERROR':
                return statusLogger({code: 400, message: 'Invalid Key'})
            case 'ER_ROW_IS_REFERENCED_2':
                return statusLogger({code: 400, message: error.message})
            case 'ER_CON_COUNT_ERROR':
                return statusLogger({code: 503, message: error.message})
            case 'ER_DB_CREATE_EXISTS':
                return statusLogger({code: 409, message: error.message})
            case 'ER_TABLE_EXISTS_ERROR':
                return statusLogger({code: 409, message: error.message})
            case 'ER_LOCK_WAIT_TIMEOUT':
                return statusLogger({code: 503, message: error.message})
            case 'ER_DATA_TOO_LONG':
                return statusLogger({code: 400, message: error.message})
            case 'ER_TRUNCATED_WRONG_VALUE':
                return statusLogger({code: 400, message: error.message})
            default:
                return statusLogger({code: 500})
        }
    } catch (error) {
        if(logging) console.error('mysqlErrCode :' + error)
        return statusLogger({code: 500})
    }
}

module.exports = mysqlErrCode