const router = require('express').Router()

function inProgress(req, res, next){
    res.status(403).json({
        code: 403,
        status: false,
        message: 'This feature is in development'
    })
}

// create new role
router.post('/', inProgress)

// find role by params id
router.get('/:id', inProgress) 

// find roles by request body
router.get('/', inProgress) 

// update role
router.put('/', inProgress) 

// delete role by params id
router.delete('/:id', inProgress) 

module.exports = router