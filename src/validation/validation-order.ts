import Joi from "joi";

export const order_schema = Joi.object({
    productid: Joi.number().required(),
    quantity: Joi.number().min(1).required(),
});