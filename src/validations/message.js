const Joi = require('joi')

const subscribe = Joi.object({
    url: Joi.string().uri().required()
})
const publish = Joi.object({
    message: Joi.required()
})
module.exports = {subscribe, publish}