const userController = require('../../controllers/user.controller')
const UnitTestFramework = require('../unit.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')
const { dataLogger } = require('../../utils/HttpLogger')

const tempToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkR3aUoiLCJpYXQiOjcyNzI3NDU1NDB9.nfk_qeWDYmH4kLbbA9rPJ-E1TjKv6a1AmgQVwI4Lv_A'

const testCases = {
    rotateToken: [
        {
            input: {cookies: {refreshToken: tempToken}},
            output: {code: 200, status: true, data: {refreshToken: 'random string', accessToken: 'random string'}},
            description: 'Success should generate new accessToken and refreshToken'
        },{
            input: {cookies: {refreshToken: 'invalid_token'}},
            output: {code: 403, status: false},
            description: 'Invali token should returning Http Error 403'
        },{
            input: {cookies: {refreshToken: undefined}},
            output: {code: 403, status: false},
            description: 'No token should returning Http Error 403'
        }
    ]
}


const testModule = () => {
    const res = {}
    const next = (req) => () => req.result

    const controller = (method, req) => userController[method](req, res, next(req))

    // mock setCookies function because this test not using express http res.cookies() method
    const setCookies = (req) => (res, tokens) => req['result'] = new dataLogger({data: tokens})
    const secret = 'SECRET_KEY'

    return {
        rotateToken: (req) => userController['rotateToken'](req, res, next(req), setCookies(req), secret)
    }
}

const test = new UnitTestFramework(testCases, testModule())

test.setBeforeAll = async () => {
    return await db.connect().then(async db => {
        await truncateAll(db)
        await seedTables(db)
    })
}
test.setAfterAll = async () => {
    await pool.end()
    await db.end()
}

test.runTest()