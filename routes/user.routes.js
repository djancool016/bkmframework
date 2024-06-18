const router = require('express').Router()

function inProgress(req, res, next){
    res.status(403).json({
        code: 403,
        status: false,
        message: 'This feature is in development'
    })
}

// Register new user
router.post('/register', inProgress)

// Login using credential username and password
router.post('/login', inProgress)

// Authenticate user using token
router.post('/authenticate', inProgress)

// Authorize user using token
router.post('/authorize', inProgress)

// Logout
router.post('/logout', inProgress)

// Find user by parameter id
router.get('/:id', inProgress)

// Find user by query or body
router.get('/', inProgress)

// Update user information
router.put('/', inProgress)

// Delete user data
router.delete('/', inProgress)

module.exports = router