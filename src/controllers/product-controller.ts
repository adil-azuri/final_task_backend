import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { product_schema } from "../validation/validation-product";
import { verifyToken } from "../utility/jwt";


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
        res.status(200).json({ products })
    } catch (error) {
        res.json({ message: error });
    }
}

export const addProduct = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const account = verifyToken(token);

    try {
        const { error } = product_schema.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const photo = req.file.filename;
        const { name, price, stock } = req.body;

        if (!account || account.role !== "admin") {
            res.status(403).json({ message: "Only admin can add products" });
            return;
        }

        const product = await prisma.products.create({
            data: {
                name,
                stock: Number(stock),
                price: Number(price),
                photo
            },
        });

        res.status(201).json({
            message: "Product added successfully",
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};



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
            return;
        }

        const updateData: any = {
            name,
            price: Number(price),
            stock: Number(stock),
        };

        if (req.file) {
            const photo = req.file.filename;
            updateData.photo = photo;
        }

        const product = await prisma.products.update({
            where: {
                id
            },
            data: updateData,
        });

        res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
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

export async function getProductDetail(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    try {
        const product = await prisma.products.findUnique({ where: { id } })

        if (!product) {
            res.status(403).json({ message: "Product not Found" });
            return
        }

        res.status(201).json({ product });
    } catch (error) {
        res.json({ message: error });
    }
}
