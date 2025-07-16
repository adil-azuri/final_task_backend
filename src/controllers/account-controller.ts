// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { serv_register } from "../services/account";
import { loginSchema, registerSchema } from "../validation/validation-account";
import { signToken, verifyToken } from "../utility/jwt";
import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";

export async function register(req: Request, res: Response) {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        const { name, password, role } = req.body;

        const account = await serv_register(name, password, role);
        res.status(201).json({ message: "Account registered", account });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        const { name, password } = req.body;
        const account = await prisma.account.findUnique({ where: { name } });
        if (!account) throw new Error("User not found");

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) throw new Error("Wrong password");

        const token = signToken({ id: account.id, name: account.name, role: account.role });

        res.cookie('token', token);

        res.json({ message: "Login success", name: account.name, role: account.role });
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
}

export async function updateProfile(req: Request, res: Response) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        let account = verifyToken(token);

        if (!account) {
            res.status(403).json({ message: "You Need login to change profile" });
            return
        }

        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const profile = req.file.filename;
        const user = await prisma.account.findUnique({ where: { id: account.id } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const updated = await prisma.account.update({
            where: { id: account.id },
            data: { profile },
        });
        res.status(200).json({ message: "Profile updated", name: updated.name, profile: updated.profile });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}