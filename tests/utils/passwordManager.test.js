const PasswordManager = require("../../utils/passwordManager")
const UnitTestFramework = require("../unit.test.framework")

const testObj = {
    encrypt: [
        {
            input: {password: 'root'},
            output: 'random string',
            description: 'Success encrypt should return hashed password'
        },{
            input: {password: undefined},
            output: {message: 'Invalid password'},
            description: 'Failed encrypt should throw error'
        }
    ],
    compare: [
        {
            input: {
                password: 'root', 
                hashedPassword: '$2b$10$h6Uo0u07tzgVf14jTsIPHOskqDUdDwLsZeMFCxX5rm8BsEJTePZd.'
            },
            output: true,
            description: 'Success compare should return true'
        },{
            input: {
                password: 1234, 
                hashedPassword: '1234'
            },
            output: {message: 'Invalid password'},
            description: 'Failed compare should throw error'
        }
    ]
}

const testModule = PasswordManager
const test = new UnitTestFramework(testObj, testModule)

test.runTest()