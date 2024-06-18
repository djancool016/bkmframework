const TokenManager = require("../../utils/tokenManager")
const UnitTestFramework = require("../unit.test.framework")

const tempToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRHdpSiIsImlhdCI6MTcxODE4MTI2MCwiZXhwIjoxNzE4MjE3MjYwfQ.z0YMYQMiMlwmWGSli9zFWgWTxmEf3avozdGCZrydo_U'

const testObj = {
    generateToken: [
        {
            input: [{name: 'DwiJ'},'SECRET_KEY'],
            description: 'Success should retunring string token'
        },{
            input: [{},'SECRET_KEY'],
            output: {message: 'empty payload'},
            description: 'Empty payload should throw error'
        },{
            input: [{name: 'DwiJ'},''],
            output: {message: 'empty signature'},
            description: 'Empty secret token should throw error'
        }
    ],
    verifyToken: [
        {
            input: [tempToken,'SECRET_KEY'],
            output: {name: 'DwiJ'},
            description: 'Success should returning payload data'
        },{
            input: ['invalid token', 'SECRET_KEY'],
            output: {message: 'jwt malformed'},
            description: 'Invalid token should throw error'
        },{
            input: ['', 'SECRET_KEY'],
            output: {message: 'empty token'},
            description: 'Empty token should throw error'
        },{
            input: [tempToken,'INVALID_SECRET_KEY'],
            output: {message: 'invalid signature'},
            description: 'Invalid payload should throw error'
        },{
            input: [tempToken,''],
            output: {message: 'empty signature'},
            description: 'Empty payload should throw error'
        }
    ]
}

const testModule = TokenManager
const test = new UnitTestFramework(testObj, testModule)

test.runTest()