const baseController = require('../../controllers/base.controller')
const RoleModel = require('../../models/role.model')
const UnitTestFramework = require('../unit.test.framework')
const {db, pool, truncateAll} = require('../../database').init()
const {seedTables} = require('../../seeders')

const output = [
    {
        id: 1, 
        name: 'Admin',
        description: "Full access to system features."
    }
]

const testCases = {
    create: [
        {
            input: {
                body: {
                    name: 'Tester Role',
                    description: 'This is tested from jest'
                }
            },
            output: {code: 201, status: true, data:{affectedRows: 1}},
            description: 'Success should returning affectedRows = 1'
        },{
            input: {
                body: {
                    nameX: 'Tester Role',
                    descriptionX: 'This is tested from jest'
                }
            },
            output: {code: 400, status: false},
            description: 'Invalid keys should returning Http Code 400'
        },{
            input: {},
            output: {code: 400, status: false},
            description: 'Invalid body should returning Http Code 400'
        }
    ],
    read: [
        {
            input: {params:{id: 1}},
            output: {code: 200, status: true, data: output},
            description: 'input params.id should run model.findByPk and returning array'
        },{
            input: {query:{id: [1, 2]}},
            output: {code: 200, status: true, data: output},
            description: 'input query.id should run model.findByKeys and returning array'
        },{
            input: {body: {id: 1, name: 'Admin'}},
            output: {code: 200, status: true, data: output},
            description: 'input body.id should run model.findByKeys and returning array'
        },{
            input: {body: {}},
            output: {code: 200, status: true, data: output},
            description: 'input empty body should run model.findAll and returning array'
        },{
            input: {body: {id: 99999}},
            output: {code: 404, status: false},
            description: 'Not found should returning Http Code 404'
        },{
            input: {},
            output: {code: 400, status: false},
            description: 'Invalid body should returning Http Code 400'
        }
    ],
    update: [
        {
            input: {
                body: {
                    id: 1,
                    name: 'updated role',
                    description: 'This is updated from jest'
                }
            },
            output: {code: 200, status: true, data:{affectedRows: 1}},
            description: 'Success should returning affectedRows = 1'
        },{
            input: {
                body: {
                    idX: 1,
                    nameX: 'updated role',
                    description: 'This is updated from jest'
                }
            },
            output: {code: 400, status: false},
            description: 'Invalid keys should returning Http Code 400'
        },{
            input: {},
            output: {code: 400, status: false},
            description: 'Invalid body should returning Http Code 400'
        }
    ],
    delete: [
        {
            input: {params: {id: 5}},
            output: {code: 200, status: true, data: {affectedRows: 1}},
            description: 'Success should returning affectedRows = 1'
        },{
            input: {params: {id: 9999}},
            output: {code: 404, status: false},
            description: 'Not found should returning Http Code 404'
        },{
            input: {params: {id: 1}},
            output: {code: 400, status: false, message: 'Id is used as foreign key'},
            description: 'Foreign Key fails should returning code 400'
        },{
            input: {},
            output: {code: 400, status: false},
            description: 'Invalid body should returning Http Code 400'
        }
    ]
}

const testModule = () => {
    const res = {}
    const next = (req) => () => req.result
    const model = new RoleModel()

    const controller = (method, req) => baseController[method](req, res, next(req), model)

    return {
        create: (req) => controller('create', req),
        read: (req) => controller('read', req),
        update: (req) => controller('update', req),
        delete: (req) => controller('destroy', req)
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