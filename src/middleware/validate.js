
const validate = (Joi, property = 'body') => {
    return (req, res, next) => {
        const {error} = Joi.validate(req[property], {abortEarly: false, allowUnknown: true})
        const valid = error == null
        if (valid) {
            next();
        } else {
            const {details} = error
            const message = details.map(i => i.message && i.message.replace(/['"]/g, '').replace(/mongo/g, '')).join(' and ')
            return res.status(422).send({
                success: false,
                message, data: []
            })
        }
    }
}
module.exports = validate;