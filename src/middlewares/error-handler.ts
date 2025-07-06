import { Request, Response, NextFunction } from "express";
import { AppError } from "../utility/app-error";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[${req.method}] ${req.originalUrl}`);
    console.error("Error:", err.message);

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
    });
};