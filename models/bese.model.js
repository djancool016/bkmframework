const { pool } = require('../database').init()
const poolConnection = pool.createPool()
const {errorCode, errorHandler} = require('../utils/CustomError')
const logging = require('../config').logging 

class BaseModel {
    constructor(queryBuilder) {
        this.queryBuilder = queryBuilder
        this.logging = logging
    }

    async create(requestBody) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runSqlQuery('create', requestBody)
    }

    async findByPk(id) {
        if(!id || typeof id !== 'number') throw errorCode.ER_INVALID_BODY
        return this.#runSqlQuery('readByPk', {id})
    }

    async findAll(requestBody) {
        if(!requestBody) throw errorCode.ER_INVALID_BODY
        return this.#runSqlQuery('readAll', requestBody)
    }

    async findByKeys(requestBody, patternMatching = true) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runSqlQuery('readByKeys', requestBody, [patternMatching])
    }

    async update(requestBody) {
        if(!requestBody || hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_BODY
        return this.#runSqlQuery('update', requestBody)
    }

    async delete(id) {
        if(!id || typeof id !== 'number') throw errorCode.ER_INVALID_BODY
        return this.#runSqlQuery('delete', {id})
    }

    async bulkOperation(operation, requestBody = []) {
        const errorList = []
        let successCount = 0

        try {
            if (!Array.isArray(requestBody)) {
                throw errorCode.ER_INVALID_BODY
            }

            await Promise.all(requestBody.map(async (body) => {
                try {
                    const result = await this[operation](body)
                    if (result.status) {
                        successCount++
                    } else {
                        result['errorBody'] = body
                        errorList.push(result)
                    }
                } catch (err) {
                    errorList.push({ ...err, errorBody: body })
                }
            }))

            if (errorList.length === 0) {
                return { status: true, data: { affectedRows: successCount } }
            }

            throw errorCode.ER_PARTIAL_BULK_ENTRY

        } catch (error) {
            const err = {
                status: false,
                httpCode: error.httpCode || 207,
                code: error.code || 'ER_PARTIAL_BULK_ENTRY',
                message: error.message,
                totalError: errorList.length,
                errorList,
            }

            if (this.logging) console.error('BaseModel.bulkOperation error', err)
            return err
        }
    }

    async #runSqlQuery(operation, requestBody, otherParams = []) {
        try {
            if(!operation) throw errorCode.ER_INVALID_METHOD

            const { query, param } = this.queryBuilder[operation](requestBody, ...otherParams)
            if(!query) throw errorCode.ER_QUERY_ERROR

            const result = await executeMysqlQuery(query, param)

            if(Array.isArray(result) && result.length == 0 ||result.affectedRows == 0){
                throw errorCode.ER_NOT_FOUND
            }
            return resultHandler({ data: result })

        } catch (error) {
            if(errorCode[error.code]){
                throw errorHandler(errorCode[error.code])
            }
            throw errorHandler(error)
        }
    }
}

function resultHandler({ data, message = '', code = '' }) {
    return data
        ? { status: true, message: message || 'success', data }
        : { status: false, message: message || 'unknown error', code: code || 'unknown code' }
}

// Execute query
async function executeMysqlQuery(query, params = []) {
    const [result] = await poolConnection.execute(query, params)
    return result
}

function hasEmptyValue(obj) {
    if(Object.keys(obj).length < 1) return true
    return Object.values(obj).some(value => value === null || value === undefined || value === '')
}


module.exports = BaseModel
