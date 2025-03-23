import { celebrate, Joi } from "celebrate";

export const validateGETPayments = celebrate({
  query: {
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
  },
});

export const validatePOSTPayments = celebrate({
  body: {
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    amount: Joi.number().min(1).required(),
  },
});
