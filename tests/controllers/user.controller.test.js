const userController = require('../../controllers/user.controller')
const UnitTestFramework = require('../unit.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')

const tempToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkR3aUoiLCJpYXQiOjcyNzI3NDU1NDB9.nfk_qeWDYmH4kLbbA9rPJ-E1TjKv6a1AmgQVwI4Lv_A'

const testCases = {
    rotateToken: [
        {
            input: {cookies: {refreshToken: tempToken}},
            output: {refreshToken: 'random string', accessToken: 'random string'},
            description: 'Success should return new tokens object'
        }
    ]
}



const testModule = () => {
    const res = {}
    const next = (req) => () => req.result

    const controller = (method, req) => userController[method](req, res, next(req))

    const setCookies = (req) => (res, tokens) => req['result'] = tokens
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