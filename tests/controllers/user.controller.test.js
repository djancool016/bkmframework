const userController = require('../../controllers/user.controller')
const UnitTestFramework = require('../unit.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')
const { dataLogger } = require('../../utils/HttpLogger')

const activeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsIm5hbWUiOiJEd2lKIiwiaWF0Ijo3MjcyNzQ1NTQwfQ.TyOgejLi1BeNzhIO1oojROgv37HMTL6K0ZGCvDWweoI'
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsIm5hbWUiOiJEd2lKIiwiaWF0IjoxNjU2MTI5MTgxfQ.YRiKrJ1Zmc6GF_iKNr9G_rj_lFja3c-UEcGW903OJ3k'

const testCases = {
    rotateToken: [
        {
            input: {cookies: {accessToken: activeToken, refreshToken: activeToken}},
            output: {httpCode: 200, data: {refreshToken: 'random string', accessToken: 'random string'}},
            description: 'Success should generate new accessToken and refreshToken'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid token should return Http Error 401'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No token should return Http Error 401'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: expiredToken}},
            output: {httpCode: 401, code: 'ER_JWT_EXPIRED'},
            description: 'Expired token should return Http Error 401'
        },{
            input: {cookies: {accessToken: expiredToken, refreshToken: activeToken}},
            output: {httpCode: 200, data: {refreshToken: 'random string', accessToken: 'random string'}},
            description: 'Expired accessToken and active refreshToken should generate new accessToken and refreshToken'
        }
    ],
    authorizeUser: [
        {
            input: {cookies: {accessToken: activeToken, refreshToken: activeToken}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Success should return user data'
        },{
            input: {cookies: {accessToken: 'invalid_token', refreshToken: activeToken}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: activeToken}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: undefined}},
            output: {httpCode: 401, code: 'ER_JWT_NOT_FOUND'},
            description: 'No tokens should return Http Error 401'
        }
    ],
    authenticateUser: [
        {
            input: {body: {username: 'admin', password: 'root'}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Success should return user data and set cookies'
        },{
            input: {body: {username: 'admin', password: 'wrong_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_PASSWORD'},
            description: 'Wrong password should return Http Error 401'
        },{
            input: {body: {username: 'nonexistent_user', password: 'any_password'}},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Nonexistent user should return Http Error 404'
        },{
            input: {body: {username: '', password: 'any_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username should return Http Error 401'
        },{
            input: {body: {username: 'admin', password: ''}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty password should return Http Error 401'
        },{
            input: {body: {username: '', password: ''}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username and password should return Http Error 401'
        }
    ],
    login: [
        {
            input: {body: {username: 'admin', password: 'root'}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Valid credentials should return Http 200 and user data'
        },{
            input: {body: {username: 'admin', password: 'wrong_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_PASSWORD'},
            description: 'Invalid password should return Http Error 401'
        },{
            input: {body: {username: 'nonexistent_user', password: 'any_password'}},
            output: {httpCode: 404, code: 'ER_NOT_FOUND'},
            description: 'Nonexistent user should return Http Error 404'
        },{
            input: {body: {username: '', password: 'any_password'}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty username should return Http Error 400'
        },{
            input: {body: {username: 'admin', password: ''}},
            output: {httpCode: 400, code: 'ER_INVALID_CREDENTIALS'},
            description: 'Empty password should return Http Error 400'
        },{
            input: {body: {username: '', password: ''}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'Empty username and password should return Http Error 400'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: activeToken}},
            output: {httpCode: 200, data: {id: 1, username: 'admin'}},
            description: 'Valid tokens should return Http 200 and user data'
        },{
            input: {cookies: {accessToken: 'invalid_token', refreshToken: activeToken}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: 'invalid_token'}},
            output: {httpCode: 401, code: 'ER_JWT_MALFORMED'},
            description: 'Invalid refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: activeToken}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'No accessToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: activeToken, refreshToken: undefined}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'No refreshToken should return Http Error 401'
        },{
            input: {cookies: {accessToken: undefined, refreshToken: undefined}},
            output: {httpCode: 403, code: 'ER_ACCESS_DENIED_ERROR'},
            description: 'No tokens should return Http Error 401'
        },{
            input: {cookies: {accessToken: expiredToken, refreshToken: activeToken}},
            output: {httpCode: 401, code: 'ER_JWT_EXPIRED'},
            description: 'Expired accessToken should return Http Error 401'
        }
    ]
}

const testModule = () => {
    const res = {}
    const next = (req) => () => req.result

    // mock setCookies function because this test not using express http res.cookies() method
    const setCookies = (req) => (res, tokens) => req['result'] = new dataLogger({data: tokens})
    const secret = {accessToken: 'SECRET_KEY', refreshToken: 'SECRET_KEY'}

    const controller = (method, req, opt = [setCookies(req), secret]) => userController[method](req, res, next(req), ...opt)

    return {
        rotateToken: (req) => controller('rotateToken', req),
        authorizeUser: (req) => controller('authorizeUser', req),
        authenticateUser: (req) => controller('authenticateUser',req),
        login: (req) => controller('login', req)
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