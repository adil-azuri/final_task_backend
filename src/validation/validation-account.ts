import { profile } from "console";
import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().required(),
});

export const loginSchema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

