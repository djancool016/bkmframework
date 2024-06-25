const userController = require('../../controllers/user.controller')
const UnitTestFramework = require('../unit.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')
const { dataLogger } = require('../../utils/HttpLogger')

const activeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsIm5hbWUiOiJEd2lKIiwiaWF0Ijo3MjcyNzQ1NTQwfQ.TyOgejLi1BeNzhIO1oojROgv37HMTL6K0ZGCvDWweoI'
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsIm5hbWUiOiJEd2lKIiwiaWF0IjoxNjU2MTI5MTgxfQ.YRiKrJ1Zmc6GF_iKNr9G_rj_lFja3c-UEcGW903OJ3k'

const testCases = {
    // rotateToken: [
    //     {
    //         input: {cookies: {refreshToken: activeToken}},
    //         output: {code: 200, status: true, data: {refreshToken: 'random string', accessToken: 'random string'}},
    //         description: 'Success should generate new accessToken and refreshToken'
    //     },{
    //         input: {cookies: {refreshToken: 'invalid_token'}},
    //         output: {code: 403, status: false},
    //         description: 'Invalid token should returning Http Error 403'
    //     },{
    //         input: {cookies: {refreshToken: undefined}},
    //         output: {code: 403, status: false},
    //         description: 'No token should returning Http Error 403'
    //     },{
    //         input: {cookies: {refreshToken: expiredToken}},
    //         output: {code: 403, status: false},
    //         description: 'Expired token should returning Http Error 403'
    //     }
    // ],
    authorizeUser: [
        {
            input: {cookies: {accessToken: activeToken, refreshToken: activeToken}},
            output: {code: 200, status: true, data: {id: 1, username: 'admin'}},
            description: 'Success should return user data'
        },{
            input: {cookies: {accessToken: 'invalid_token', refreshToken: activeToken}},
            output: {code: 403, status: false},
            description: 'Invalid accessToken should return Http Error 403'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: 'invalid_token'}},
            output: {code: 403, status: false},
            description: 'Invalid refreshToken should return Http Error 403'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: activeToken}},
            output: {code: 403, status: false},
            description: 'No accessToken should return Http Error 403'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: undefined}},
            output: {code: 403, status: false},
            description: 'No refreshToken should return Http Error 403'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: undefined}},
            output: {code: 403, status: false},
            description: 'No tokens should return Http Error 403'
        }
    ]
}


const testModule = () => {
    const res = {}
    const next = (req) => () => req.result

    const controller = (method, req, opt = []) => userController[method](req, res, next(req), ...opt)

    // mock setCookies function because this test not using express http res.cookies() method
    const setCookies = (req) => (res, tokens) => req['result'] = new dataLogger({data: tokens})
    const secret = {accessToken: 'SECRET_KEY', refreshToken: 'SECRET_KEY'}

    return {
        rotateToken: (req) => controller('rotateToken', req, [setCookies(req), secret]),
        authorizeUser: (req) => controller('authorizeUser', req, [setCookies(req), secret])
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