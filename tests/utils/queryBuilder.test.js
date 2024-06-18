const QueryBuilder = require('../../utils/QueryBuilder')
const UnitTestFramework = require("../unit.test.framework")

const init = {
    table: 'users',
    includes: [
        'id','roleId','statusId','username', 'password','email', 
        'name', 'phone', 'address','nik'
    ],
    association: [
        {
            table: 'roles',
            references: 'roles.id',
            foreignKey: 'users.roleId',
            includes: ['name'],
            alias: {
                name: 'role'
            }
        },{
            table: 'status',
            references: 'status.id',
            foreignKey: 'users.statusId',
            includes: ['name'],
            alias: {
                name: 'status'
            }
        }
    ]
}

const testObj = {
    create: [
        {
            input: {name: 'DwiJ', username:'admin'},
            output: '',
            description: 'Success should return object contains CREATE query and params'
        }
    ],
    readByPk: [
        {
            input: {id: 1},
            output: '',
            description: 'Success should return object contains SELECT query and params'
        }
    ],
    readAll: [
        {
            input: {},
            output: '',
            description: 'Success should return object contains SELECT query and params'
        }
    ],
    readByKeys: [
        {
            input: {name: 'DwiJ', roleId: 1, role: 'admin', status: 'active'},
            output: '',
            description: 'Success should return object contains SELECT query and params'
        }
    ],
    update: [
        {
            input: {id: 1, name: 'JDwyne'},
            output: '',
            description: 'Success should return object contains UPDATE query and params'
        }
    ],
    delete: [
        {
            input: {id: 1},
            output: '',
            description: 'Success should return object contains DELETE query and params'
        }
    ]
}

const testModule = new QueryBuilder(init)

const test = new UnitTestFramework(testObj, testModule)

test.runTest()