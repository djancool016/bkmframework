const logging = require('../config').logging

const errorCode = {
    // Database Error Cases
    'ER_ACCESS_DENIED_ERROR': { 
        httpCode: 403, type: 'DB_Error', code: 'ER_ACCESS_DENIED_ERROR', message: 'Access denied' 
    },
    'ER_BAD_DB_ERROR': { 
        httpCode: 404, type: 'DB_Error', code: 'ER_BAD_DB_ERROR', message: 'Database not found' 
    },
    'ER_PARTIAL_BULK_ENTRY': { 
        httpCode: 207, type: 'DB_Error', code: 'ER_PARTIAL_BULK_ENTRY', message: 'Part of operations is terminated' 
    },
    'ER_NOT_FOUND': { 
        httpCode: 404, type: 'DB_Error', code: 'ER_NOT_FOUND', message: 'Resource not found' 
    },
    'ER_DUP_ENTRY': { 
        httpCode: 409, type: 'DB_Error', code: 'ER_DUP_ENTRY', message: 'Duplicate entry' 
    },
    'ER_NO_SUCH_TABLE': { 
        httpCode: 404, type: 'DB_Error', code: 'ER_NO_SUCH_TABLE', message: 'Table not found' 
    },
    'ER_NO_DATA': { 
        httpCode: 404, type: 'DB_Error', code: 'ER_NO_DATA', message: 'No data found' 
    },
    'ER_PARSE_ERROR': { 
        httpCode: 400, type: 'DB_Error', code: 'ER_PARSE_ERROR', message: 'Parse error' 
    },
    'ER_INVALID_BODY': { 
        httpCode: 400, type: 'DB_Error', code: 'ER_INVALID_BODY', message: 'Invalid request body' 
    },
    'ER_BAD_FIELD_ERROR': { 
        httpCode: 400, type: 'DB_Error', code: 'ER_BAD_FIELD_ERROR', message: 'Invalid field key' 
    },
    'ER_ROW_IS_REFERENCED_2': { 
        httpCode: 400, type: 'DB_Error', code: 'ER_ROW_IS_REFERENCED_2', message: 'Row is referenced' 
    },
    'ER_CON_COUNT_ERROR': { 
        httpCode: 503, type: 'DB_Error', code: 'ER_CON_COUNT_ERROR', message: 'Connection count error' 
    },
    'ER_DB_CREATE_EXISTS': { 
        httpCode: 409, type: 'DB_Error', code: 'ER_DB_CREATE_EXISTS', message: 'Database already exists' 
    },
    'ER_TABLE_EXISTS_ERROR': { 
        httpCode: 409, type: 'DB_Error', code: 'ER_TABLE_EXISTS_ERROR', message: 'Table already exists' 
    },
    'ER_LOCK_WAIT_TIMEOUT': { 
        httpCode: 503, type: 'DB_Error', code: 'ER_LOCK_WAIT_TIMEOUT', message: 'Lock wait timeout' 
    },
    'ER_DATA_TOO_LONG': { 
        httpCode: 400, type: 'DB_Error', code: 'ER_DATA_TOO_LONG', message: 'Data too long' 
    },
    'ER_TRUNCATED_WRONG_VALUE': { 
        httpCode: 400, type: 'DB_Error', code: 'ER_TRUNCATED_WRONG_VALUE', message: 'Truncated wrong value' 
    },

    // JWT Error Cases
    'ER_JWT_FAILED_CREATE_TOKEN': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_FAILED_CREATE_TOKEN', message: 'Failed to create new token' 
    },
    'ER_JWT_MALFORMED': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_MALFORMED', message: 'JWT Malformed' 
    },
    'ER_JWT_NOT_FOUND': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_NOT_FOUND', message: 'JWT Not Found' 
    },
    'ER_JWT_EMPTY_PAYLOAD': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_EMPTY_PAYLOAD', message: 'JWT Empty Payload' 
    },
    'ER_JWT_EXPIRED': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_EXPIRED', message: 'JWT Expired' 
    },
    'ER_JWT_EMPTY_SIGNATURE': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_EMPTY_SIGNATURE', message: 'JWT Signature Empty' 
    },
    'ER_JWT_PAYLOAD_INVALID': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_PAYLOAD_INVALID', message: 'JWT Payload Invalid' 
    },
    'ER_JWT_INVALID': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_INVALID', message: 'JWT Invalid' 
    },
    'ER_JWT_SIGNATURE_MISMATCH': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_SIGNATURE_MISMATCH', message: 'JWT Signature Mismatch' 
    },
    'ER_JWT_ALGORITHM_NOT_SUPPORTED': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_ALGORITHM_NOT_SUPPORTED', message: 'JWT Algorithm Not Supported' 
    },
    'ER_JWT_ISSUER_INVALID': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_ISSUER_INVALID', message: 'JWT Issuer Invalid' 
    },
    'ER_JWT_AUDIENCE_INVALID': { 
        httpCode: 401, type: 'JWT_Error', code: 'ER_JWT_AUDIENCE_INVALID', message: 'JWT Audience Invalid' 
    },

    // User Form Error Cases
    'ER_EMPTY_CREDENTIALS': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_EMPTY_CREDENTIALS', message: 'Empty user credential' 
    },
    'ER_EMPTY_PASSWORD': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_EMPTY_PASSWORD', message: 'Empty Password' 
    },
    'ER_INVALID_PASSWORD': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_INVALID_PASSWORD', message: 'Invalid Password' 
    },
    'ER_INVALID_PASSWORD_FORMAT': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_INVALID_PASSWORD_FORMAT', message: 'Invalid Password Format' 
    },
    'ER_INVALID_USERNAME': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_INVALID_USERNAME', message: 'Invalid Username' 
    },
    'ER_USERNAME_TAKEN': { 
        httpCode: 409, type: 'Input_Error', code: 'ER_USERNAME_TAKEN', message: 'Username already taken' 
    },
    'ER_EMAIL_TAKEN': { 
        httpCode: 409, type: 'Input_Error', code: 'ER_EMAIL_TAKEN', message: 'Email already taken' 
    },
    'ER_INVALID_EMAIL': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_INVALID_EMAIL', message: 'Invalid Email' 
    },
    'ER_PASSWORD_TOO_SHORT': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_PASSWORD_TOO_SHORT', message: 'Password too short' 
    },
    'ER_PASSWORD_TOO_WEAK': { 
        httpCode: 400, type: 'Input_Error', code: 'ER_PASSWORD_TOO_WEAK', message: 'Password too weak' 
    },

    // Query Builder Error
    'ER_INVALID_QUERY_PARAMS': { 
        httpCode: 500, type: 'Query_Error', code: 'ER_INVALID_QUERY_PARAMS', message: 'Invalid query builder params' 
    },

    // Password Manager Error
    'ER_INVALID_HASH_FORMAT': {
        httpCode: 500, type: 'Password_Manager_Error', code: 'ER_HASHING_PASSWORD', message: 'Password Hashing Error' 
    },
    'ER_EMPTY_HASHED_PASSWORD': {
        httpCode: 500, type: 'Password_Manager_Error', code: 'ER_EMPTY_HASHED_PASSWORD', message: 'Empty Hashed Password' 
    },
    'ER_COMPARE_PASSWORD': {
        httpCode: 500, type: 'Password_Manager_Error', code: 'ER_COMPARE_PASSWORD', message: 'Error compare password with hash' 
    },

    // Internal Model Error
    'ER_INVALID_METHOD': {
        httpCode: 500, type: 'Model_Error', code: 'ER_INVALID_METHOD', message: 'Invalid method is called' 
    },
    'ER_QUERY_ERROR': {
        httpCode: 500, type: 'Model_Error', code: 'ER_QUERY_PARAM', message: 'Query id not defined' 
    },

    // unknown error
    'INTERNAL_SERVER_ERROR': { 
        httpCode: 500, type: 'Unknown_Error', code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' 
    }
}

class CustomError extends Error {
    constructor(error){
        super(error.message)
        for(const key in error){
            this[key] = error[key] 
        }
        this.name = this.constructor.name
    }
}

function errorHandler(error){
    if(logging) console.error(error)
    const errorDetail = errorCode[error.code] || errorCode.INTERNAL_SERVER_ERROR
    throw new CustomError(errorDetail)
}

module.exports = {errorCode, errorHandler}