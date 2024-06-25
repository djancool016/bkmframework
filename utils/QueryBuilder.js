const logging = require('../config').logging
const {errorCode, errorHandler} = require('../utils/CustomError')

class QueryBuilder {
    constructor({table = '', includes = [], alias = [], association = []}){
        this.table = table
        this.select = selectBuilder({table, includes, alias, association}) || ''
        this.join = joinBuilder({association}) || ''
        this.where = (requestBody, patternMatching = true) => {
            return whereBuilder({table, includes, association}, requestBody, patternMatching) || ''
        }
        this.paging = (requestBody) => {
            return pagingBuilder(requestBody) || ''
        }
       
    }
    create(requestBody){
        try {
            if(hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_QUERY_PARAMS

            // extract keys and values from object data
            const keys = Object.keys(requestBody)

            // create placeholder for the values
            const placeholders = keys.map(() => '?').join(', ')

            return {
                query: `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`,
                param: paramsBuilder(requestBody, [], false, false)
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    readByPk(requestBody){
        try {
            if(hasEmptyValue(requestBody) || typeof requestBody.id !== 'number') throw errorCode.ER_INVALID_QUERY_PARAMS

            return {
                query: `SELECT ${this.select} FROM ${this.table} ${this.join} WHERE ${this.table}.id = ?`,
                param: [requestBody.id]
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    readAll(requestBody){
        try {
            const paging = this.paging(requestBody)
            return {
                query: `SELECT ${this.select} FROM ${this.table} ${this.join} ${paging}`,
                param: []
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
    readByKeys(requestBody, patternMatching = true){
        try {
            if(hasEmptyValue(requestBody)) throw errorCode.ER_INVALID_QUERY_PARAMS

            const where = this.where(requestBody, patternMatching)
            const paging = this.paging(requestBody)
            const binary = !patternMatching ? 'BINARY' : ''

            return {
                query: `SELECT ${this.select} FROM ${this.table} ${this.join} WHERE ${binary} ${where} ${paging}`,
                param: paramsBuilder(requestBody, [], true, patternMatching)
            }

        } catch (error) {
            throw errorHandler(error)
        }
    }
    update(requestBody){
        try {
            if(hasEmptyValue(requestBody) || typeof requestBody.id !== 'number') throw errorCode.ER_INVALID_QUERY_PARAMS

            const {id, ...data} = requestBody

            if(hasEmptyValue(data)) throw errorCode.ER_INVALID_QUERY_PARAMS

            // extract keys and values from object data
            const keys = Object.keys(data)
            const params = paramsBuilder(requestBody, ['id'], false, false)
            params.push(id)

            // construct placeholder for updated columns
            const placeholder = keys.map(key => `${key} = ?`).join(', ')

            return {
                query: `UPDATE ${this.table} SET ${placeholder} WHERE ${this.table}.id = ?`,
                param: params
            }

        } catch (error) {
            throw errorHandler(error)
        }
    }
    delete(requestBody){
        try {
            if(hasEmptyValue(requestBody) || typeof requestBody.id !== 'number') throw errorCode.ER_INVALID_QUERY_PARAMS
            
            return {
                query: `DELETE FROM ${this.table} WHERE ${this.table}.id = ?`,
                param: [requestBody.id]
            }
        } catch (error) {
            throw errorHandler(error)
        }
    }
}
function paramsBuilder(requestBody, excludedKeys = [], allowedArrayValue = false, patternMatching = true) {
    // Extract keys and values from object data
    const keys = Object.keys(requestBody)
    const params = keys
        .filter(key => !excludedKeys.includes(key)) // Exclude keys present in excludedKeys
        .flatMap(key => {
            const value = requestBody[key]
            if(Array.isArray(value) && allowedArrayValue){
                return value
            }else if(patternMatching && typeof value === 'string'){
                return [`%${value}%`]
            }else{
                return [value]
            }
        })

    return params
}

function selectBuilder({table, includes, alias, association = []}){
    
    const queries = []

    const selectQuery = (table, includes, alias) => {
        if(includes.length > 0){
            return includes.map(column => {
                // If the column exists in the alias object, use the alias value, otherwise use the column itself
                if(column && alias && alias[column]){
                    return `${table}.${column} AS ${alias[column]}`
                }else{
                    return `${table}.${column}`
                }
            }).join(', ')
        } 
        return `${table}.*`
    }

    queries.push(selectQuery(table, includes, alias))

    if(association && Array.isArray(association) && association.length > 0){
        association.forEach( assoc => {
            const {table, includes, alias} = assoc
            queries.push(selectQuery(table, includes, alias))
        })
    }

    return queries.join(', ')
}

function joinBuilder({association}) {

    if (!association || association.length === 0) return ''

    return association.map(({ table, foreignKey, references, joinType }) =>{
        const join = joinType ? joinType : 'INNER JOIN'
        return `${join} ${table} ON ${foreignKey} = ${references}`
    }).join(' ')
    
}

function whereBuilder({table, includes, association}, requestBody, patternMatching = false) {

    const includedKeys = []

    const operationBuilder = (value) => {
        if(Array.isArray(value)){
            const placeholder = value.map(() => '?').join(',')
            return `IN (${placeholder})`
        }else if(typeof value === 'string' && value.length > 2 && patternMatching){
            return 'LIKE ?'
        }else{
            return '= ?'
        }
    }

    // 'WHERE' query builder for main table
    for(let key in requestBody){
        const value = requestBody[key]
        if(includes.includes(key)){
            includedKeys.push(`${table}.${key} ${operationBuilder(value)}`)
        }
    }

    // 'WHERE' query builder for association table using alias as keys
    association.forEach(assoc => {
        if(assoc.alias){
            for(let aliasKey in assoc.alias){
                for(let requestKey in requestBody){
                    const value = requestBody[requestKey]
                    if(requestKey == aliasKey){
                        includedKeys.push(`${assoc.table}.${aliasKey} ${operationBuilder(value)}`)
                    }
                }
            }
        }
    })

    return includedKeys.join(' AND ')
}

function pagingBuilder(requestBody){
    
    const page = requestBody?.page || 1
    const pageSize = requestBody?.pageSize || 10

    const limit = pageSize
    const offset = (page - 1) * (pageSize)
    
    return `LIMIT ${limit} OFFSET ${offset}`
}

function hasEmptyValue(obj) {
    if(Object.keys(obj).length < 1) return true
    return Object.values(obj).some(value => value === null || value === undefined || value === '')
}


module.exports = QueryBuilder