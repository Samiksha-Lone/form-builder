const Joi = require('joi');

const formSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  questions: Joi.array().items(
    Joi.object({
      fieldId: Joi.string().required(),
      label: Joi.string().required(),
      type: Joi.string().valid('shortText', 'longText', 'singleSelect').required(),
      required: Joi.boolean().default(false),
      options: Joi.array().items(Joi.string()).optional(),
      conditionalRules: Joi.object({
        logic: Joi.string().valid('AND', 'OR'),
        conditions: Joi.array().items(
          Joi.object({
            questionKey: Joi.string().required(),
            operator: Joi.string().valid('equals', 'notEquals', 'contains').required(),
            value: Joi.any().required()
          })
        )
      }).allow(null).optional()
    })
  ).min(1).required()
});

const submissionSchema = Joi.object({
  answers: Joi.object().required()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation Failed', 
      details: error.details.map(d => d.message) 
    });
  }
  next();
};

module.exports = {
  validateForm: validate(formSchema),
  validateSubmission: validate(submissionSchema)
};
