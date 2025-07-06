import Joi from "joi";

export const product_schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(10000).required(),
    stock: Joi.number().min(10).required(),
});