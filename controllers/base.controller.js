const {statusLogger, dataLogger} = require('../utils/HttpLogger')
const mysqlErrHandler = require('../utils/MysqlErrorCode')
const CustomError = require('../utils/CustomError')
const logging = require('../config').logging

async function create(req, res, next, model){
    try {
        if(req.result?.status === false) return next()

        const result = await model.create(req.body)

        if(result.status){
            req.result = dataLogger({code: 201, data: result.data})
        }else {
            throw result
        }
        // Continue to next middleware
        return next()
        
    } catch (error) {
        if(logging) console.error(error)
        req.result = mysqlErrHandler(error)
        return next()
    }
}
async function read(req, res, next, model){
    try {
        let result 

        switch(requestType(req)){
            case 'query':
                result = await model.findByKeys(req.query)
                break
            case 'params':
                result = await model.findByPk(req.params.id)
                break
            case 'body':
                result = await model.findByKeys(req.body) 
                break
            case 'empty':
                result = await model.findAll(req.body)
                break
            default:
                throw new CustomError('ER_INVALID_BODY')
        }

        if(result.status){
            req.result = dataLogger({data: result.data})
        }else{
            throw result
        }
        return next()

    } catch (error) {
        if(logging) console.error(error)
        req.result = mysqlErrHandler(error)
        return next()
    }
}
async function update(req, res, next, model){
    try {
        if(req.result?.status === false) return next()

        const result = await model.update(req.body) 

        if(result.data){
            req.result = dataLogger({data: result.data})
        }else{
            throw result
        }
        return next()

    } catch (error) {
        if(logging) console.error(error)
        req.result = mysqlErrHandler(error)
        return next()
    }
}
async function destroy(req, res, next, model){
    try {
        if(req.result?.status === false) return next()
    
        let id

        switch(requestType(req)){
            case 'query':
                id = req.query.id
                break
            case 'params':
                id = req.params.id
                break
            case 'body':
                id = req.body.id
                break
            default:
                throw new CustomError('ER_INVALID_BODY')
        }
        const result = await model.delete(id)

        if(result.data){
            req.result = dataLogger({data: result.data})
        }else{
            throw result
        }
        return next()

    } catch (error) {
        if(error.code == 'ER_ROW_IS_REFERENCED_2'){
            error.message = 'Id is used as foreign key'
        }
        if(logging) console.error(error)
        req.result = mysqlErrHandler(error)
        return next()
    }
}
/**
 * Sends response based on request result.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
function sendResponse(req, res) {
    if(req.result){
        res.status(req.result.code).json(req.result)
    }else {
        res.status(500).json(statusLogger({
            code: 500, 
            message:'BaseControllerBadResponse'
        }))
    }
}

function requestType(req) {
    const isFindAll = () => {
        const data = req.body || req.query || {}
        const keys = Object.keys(data)
        return keys.length === 0 || (keys.length === 2 && keys.includes('page') && keys.includes('pageSize'))
    }

    if (Array.isArray(req.body)) {
        return 'body_array'
    } 
    if (req.params && Object.keys(req.params).length > 0) {
        return 'params'
    }
    if (isFindAll()) {
        return 'empty'
    }
    if (req.query && Object.keys(req.query).length > 0) {
        return 'query'
    }
    if (req.body && Object.keys(req.body).length > 0) {
        return 'body'
    }
    return 'invalid'
}

module.exports = {
    create, read, update, destroy, sendResponse
}
