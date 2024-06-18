const UnitTestFramework = require("../unit.test.framework")
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')
const RoleModel = require('../../models/role.model')

const validUser = {
    name: 'Tester Role',
    description: 'This is tested from jest'
}

const invalidUser = {
    nameX: 'Tester Role',
    description: 'This is tested from jest'
}

const validResult = [
    {
        id: 1, 
        name: 'Admin',
        description: "Full access to system features."
    }
]

const testCases = {
    create: [
        {
            input: validUser,
            output: {status: true, data:{affectedRows: 1}},
            description: 'Success should returning affectedRows = 1'
        },{
            input: invalidUser,
            output: {status: false, code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        }
    ],
    findByPk: [
        {
            input: 1,
            output: {status: true, data: validResult},
            description: 'Success should returning array of objects'
        },{
            input: 'unknown',
            output: {status: false, code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        }
    ],
    findAll: [
        {
            input: {},
            output: {status: true, data: validResult},
            description: 'Success should returning array of objects'
        }
    ],
    findByKeys: [
        {
            input: {id:1, name: 'adm'},
            output: {status: true, data:validResult},
            description: 'Success should returning array of objects'
        },{
            input: {id:1, name: 'adm', other: 'unknown key'},
            output: {status: false, code: 'ER_NOT_FOUND'},
            description: 'Empty result should throwing error code ER_NOT_FOUND'
        }
    ],
    update: [
        {
            input: {id: 2, name: 'New Role'},
            output: {status: true, data: {affectedRows: 1}},
            description: 'Success should affectedRows  = 1'
        },{
            input: {id: 2, nameX: 'New Role'},
            output: {status: false, code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        }
    ],
    delete: [
        {
            input: 2,
            output: {status: true, data: {affectedRows: 1}},
            description: 'Success should affectedRows  = 1'
        },{
            inputX: 1,
            output: {status: false, code: 'ER_BAD_FIELD_ERROR'},
            description: 'Invalid input should throwing error code ER_BAD_FIELD_ERROR'
        }
    ]
}

const testModule = new RoleModel()

const test = new UnitTestFramework(testCases, testModule)

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