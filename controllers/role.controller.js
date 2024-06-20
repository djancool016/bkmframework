const RoleModel = require('../models/role.model')

const baseController = require('./base.controller')
const model = new RoleModel()

const controller = (method) => (req, res, next) => baseController[method](req, res, next, model)

module.exports = {
    create: controller('create'),
    read: controller('read'),
    update: controller('update'),
    destroy: controller('destroy')
}