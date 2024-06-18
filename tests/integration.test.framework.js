const {db, pool} = require('../database').init()

/**
 * Data-Driven Testing (DDT) for module classes
 */
class TestFramework {
    /**
     * 
     * @param {Object} testObj test cases
     * @param {Object} module instance of the module class
     */
    constructor(testObj = {}, module) {
        this.testObj = testObj
        this.module = module
    }

    async beforeAll() {

    }

    async afterAll() {

    }

    async testBuilder() {
        for (const [method, testCases] of Object.entries(this.testObj)) {
            this.testMethod(method, testCases)
        }
    }

    async runTest() {
        describe(`Test class ${this.module.constructor.name}`, () => {
            beforeAll(async () => this.beforeAll())

            this.testBuilder()

            afterAll(async () => this.afterAll())
        })
    }
}

module.exports = TestFramework