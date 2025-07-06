import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { product_schema } from "../validation/validation-product";
import { photo_product } from "../services/products";
import { verifyToken } from "../utility/jwt";


export async function addProduct(req: Request, res: Response) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const account = verifyToken(token);
    console.log(account);

    try {
        const { error } = product_schema.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        const { name, price, stock } = req.body;
        if (!account || account.role !== "admin") {
            res.status(403).json({ message: "Only admin can add products" });
            return
        }

        const product = await prisma.products.create({
            data: {
                name,
                stock,
                price,
            },
        });

        res.status(201).json({
            message: "Product added successfully",
            product,
        });
    } catch (error) {
        res.json({ message: error });
    }
}


export async function updateProduct(req: Request, res: Response) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const account = verifyToken(token);
    const id = parseInt(req.params.id);
    try {
        const { error } = product_schema.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        const { name, price, stock } = req.body;

        if (!account || account.role !== "admin") {
            res.status(403).json({ message: "Only admin can update this product" });
            return
        }

        const product = await prisma.products.update({
            where: {
                id
            },
            data: {
                name,
                price,
                stock,
            },
        });

        res.status(201).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        res.json({ message: error });
    }
}

export async function deleteProduct(req: Request, res: Response) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const account = verifyToken(token);
    const id = parseInt(req.params.id);
    try {
        const product = await prisma.products.findUnique({ where: { id } })

        if (!product) {
            res.status(403).json({ message: "Product not Found" });
            return
        }

        if (!account || account.role !== "admin") {
            res.status(403).json({ message: "Only admin can delete this product" });
            return
        }

        await prisma.products.delete({ where: { id } });

        res.status(201).json({ message: "Product deleted successfully", });
    } catch (error) {
        res.json({ message: error });
    }
}

export async function getProduct(req: Request, res: Response) {
    const { sortBy, order, minPrice, maxPrice, limit, offset } = req.query

    const filters: any = {}
    if (minPrice) filters.price = { gte: parseFloat(minPrice as string) }
    if (maxPrice) {
        filters.price = {
            ...(filters.price || {}),
            lte: parseFloat(maxPrice as string)
        }
    }
    try {
        const products = await prisma.products.findMany(
            {
                where: {
                    ...filters,
                },
                orderBy: {
                    [sortBy as string]: order as "asc" | "desc"
                },
                take: Number(limit),
                skip: Number(offset)
            }
        )
        const total = await prisma.products.count({ where: filters })
        res.status(200).json({ data: products, total })
    } catch (error) {
        res.json({ message: error });
    }
}

export async function updatePhotoProduct(req: Request, res: Response) {
    const id = parseInt(req.params.id)
    try {
        if (!req.file) {
            res.status(400).json({ message: "no file Upload" });
            return;
        }
        const photo = req.file.filename

        const update = await photo_product(id, photo);
        res.status(201).json({ message: "Photo Product Updated", update });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}