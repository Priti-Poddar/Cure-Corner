const Joi = require("joi");

module.exports.medicineSchema = Joi.object({
  medicine: Joi.object({
    drugName: Joi.string().required(),
    manufacturer: Joi.string(),
    description: Joi.string().required(),
    consumeType: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
  }).required(),
});

module.exports.doctorSchema = Joi.object({
  doctor: Joi.object({
    specialization: Joi.string().required(),
    experience: Joi.number().required(),
    availableSlots: Joi.string().required(),
    fees: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
  }).required(),
});