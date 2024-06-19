const { pool } = require('../database').init()
const poolConnection = pool.createPool()
const CustomError = require('../utils/CustomError')
const logging = require('../config').logging 

class BaseModel {
    constructor(queryBuilder) {
        this.queryBuilder = queryBuilder
        this.logging = logging
    }

    async create(requestBody) {
        return this.#runSqlQuery('create', requestBody)
    }

    async findByPk(id) {
        const body = id? {id} : undefined
        return this.#runSqlQuery('readByPk', body)
    }

    async findAll(requestBody) {
        return this.#runSqlQuery('readAll', requestBody)
    }

    async findByKeys(requestBody, patternMatching = true) {
        return this.#runSqlQuery('readByKeys', requestBody, [patternMatching])
    }

    async update(requestBody) {
        return this.#runSqlQuery('update', requestBody)
    }

    async delete(id) {
        const body = id? {id} : undefined
        return this.#runSqlQuery('delete', body)
    }

    async bulkOperation(operation, requestBody = []) {
        const errorList = []
        let successCount = 0

        try {
            if (!Array.isArray(requestBody)) {
                throw new CustomError('ER_BAD_REQUEST', 'Invalid request body: expected an array')
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

            throw new CustomError('ER_PARTIAL_BULK_ENTRY', `Part of ${operation} operation is terminated`)

        } catch (error) {
            const err = {
                status: false,
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
            if(requestBody == undefined) throw new CustomError('ER_INVALID_BODY', 'Invalid request format')

            const { query, param } = this.queryBuilder[operation](requestBody, ...otherParams)
            
            const result = await executeMysqlQuery(query, param)

            if(
                Array.isArray(result) && result.length == 0 ||
                result.affectedRows == 0
            ){
                throw new CustomError('ER_NOT_FOUND', 'Data not found')
            }
        

            return resultHandler({ data: result })

        } catch (error) {
            const err = {
                code: error.code,
                message: error.message,
            }
            if(error.message?.includes('Bind parameters must not contain undefined')){
                err.code = 'ER_BAD_FIELD_ERROR'
                err.message = 'Invalid Identifier'
            }
            if (this.logging) console.error(`BaseModel.${operation} error`, err)
            return resultHandler(err)
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

module.exports = BaseModel
