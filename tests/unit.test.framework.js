/**
 * Data-Driven Testing (DDT) for testModule classes
 */
class UnitTestFramework {
    /**
     * Constructor to initialize the UnitTestFramework
     * @param {Object} testObj - Object containing test cases
     * @param {Object} testModule - Instance of the testModule class
     */
    constructor(testObj = {}, testModule) {
        this.testObj = testObj // Store test cases
        this.testModule = testModule // Store the test module instance
        this.beforeAll = async () => {}
        this.afterAll = async () => {}
    }
    
    /**
     * Method to test a specific method of the testModule with given test cases
     * @param {string} method - Method name to be tested
     * @param {Array} testCases - Array of test cases for the method
     */
    testMethod(method, testCases) {
        describe(`Test ${method} method`, () => {
            testCases.forEach(testCase => {
                const {input, output, description} = testCase // Destructure test case

                test(description, async () => {
                    try {
                        let result
                        if (Array.isArray(input)) {
                            // If input is an array, spread it as multiple parameters
                            result = async () => this.testModule[method](...input)
                        } else {
                            // Otherwise, use input as a single parameter
                            result = async () => this.testModule[method](input)
                        }
                        // Compare test result with expected output
                        this.resultBuilder(await result(), output)
                    } catch (error) {
                        // Handle error and compare with expected output if any
                        expect(error).toEqual(expect.objectContaining(output))
                    }
                })
            })
        })
    }

    /**
     * Method to validate the result against the expected output
     * @param {*} result - Result from the test method
     * @param {*} output - Expected output
     */
    resultBuilder(result, output) {
        console.log(result)
        switch(typeof result) {
            case 'number':
                // Validate data type and value for numbers
                expect(typeof result).toBe('number')
                if(output != 'random number') expect(result).toEqual(output)
                break
            case 'string':
                // Validate data type and value for strings
                expect(typeof result).toBe('string')
                if(output != 'random string') expect(result).toEqual(output)
                break
            case 'boolean':
                // Validate data type and value for booleans
                expect(typeof result).toBe('boolean')
                if(output !== undefined) expect(result).toEqual(output)
                break
            case 'object':
                if(Array.isArray(result) && output) {
                    // Validate arrays by ensuring they contain expected objects
                    expect(result).toEqual(expect.arrayContaining(
                        output.map(out => expect.objectContaining(out))
                    ))
                }else if(hasNestedObject(output) || hasNestedObject(result)){
            
                    // Recursively validate nested objects
                    for (const key in output) {
                        this.resultBuilder(result[key], output[key])
                    }
                }else if(output){
                    expect(result).toEqual(expect.objectContaining(output))
                }else {
                    expect(result).toBeDefined()
                    expect(Object.keys(result).length).toBeGreaterThan(0)
                }
                break
            case 'undefined':{
                expect(result).toBe(output)
                break
            }
            default:
                throw new Error('INVALID DATATYPE')
        }
    }

    /**
     * Hook to execute before all tests
     * @param {Function} fn - set async function for jest beforeAll()
     */
    set setBeforeAll(fn){
        this.beforeAll = fn
    }

    /**
     * Hook to execute after all tests
     * @param {Function} fn - set async function for jest afterAll()
     */
    set setAfterAll(fn){
        this.afterAll = fn
    }

    /**
     * Method to build and execute tests for all methods in testObj
     */
    async testBuilder() {
        for (const [method, testCases] of Object.entries(this.testObj)) {
            this.testMethod(method, testCases) // Test each method with its test cases
        }
    }

    /**
     * Method to run all tests within a test suite
     */
    async runTest() {
        describe(`Test class ${this.testModule.constructor.name}`, () => {
            beforeAll(async () => await this.beforeAll()) // Setup before all tests

            this.testBuilder() // Build and run tests

            afterAll(async () => await this.afterAll()) // Cleanup after all tests
        })
    }
}

function hasNestedObject(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
        return true
        }
    }
    return false
}

function isObject(obj){
    return (Object.keys(obj) > 0)
}

module.exports = UnitTestFramework