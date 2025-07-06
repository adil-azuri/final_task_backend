import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { order_schema } from "../validation/validation-order";
import { signToken, verifyToken } from "../utility/jwt";
import { log } from "console";

export async function addOrder(req: Request, res: Response) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const account = verifyToken(token);

        const { error } = order_schema.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }
        if (!account || account.role !== "user") {
            res.status(403).json({ message: "Only user can add order, please login first" });
            return
        }

        const { productid, quantity } = req.body;

        const product = await prisma.products.findUnique({ where: { id: productid } })
        if (!product) {
            res.status(403).json({ message: "Product not Found" });
            return
        }

        const total = quantity * product.price

        const userid = account.id

        const order = await prisma.order.create({
            data: {
                userid,
                Productid: productid,
                quantity,
                total: total
            },
        });

        const points = total / 10000;
        await prisma.$transaction([
            prisma.account.update({
                where: { id: account.id },
                data: {
                    point: {
                        increment: points as number
                    }
                }
            }),
            prisma.products.update({
                where: { id: productid },
                data: {
                    stock: {
                        decrement: quantity as number
                    }
                }
            })
        ]);

        res.status(201).json({ message: "add Order successfully", order });
    } catch (error) {
        res.json({ message: error });
    }
}

export async function updateOrder(req: Request, res: Response) {
    let account;
    const id = parseInt(req.params.id);
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        account = verifyToken(token);

        const { error } = order_schema.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.message });
            return;
        }

        if (!account || account.role !== "user") {
            res.status(403).json({ message: "Only user can update this order" });
            return
        }

        //jika userid pada token tidak sama dengan userid pada order 
        const findOrder = await prisma.order.findUnique({ where: { id } })
        if (account.id !== findOrder?.userid) {
            res.status(403).json({ message: "Only user who order can update this order" });
            return
        }


        const { productid, quantity } = req.body;

        const product = await prisma.products.findUnique({ where: { id: productid } })
        if (!product) {
            res.status(403).json({ message: "Product not Found" });
            return
        }

        const total = quantity * product.price

        const order = await prisma.order.update({
            where: {
                id
            },
            data: {
                Productid: productid,
                quantity,
                total
            },
        });
        const points = total / 10000;
        await prisma.$transaction([
            prisma.account.update({
                where: { id: account.id },
                data: {
                    point: {
                        increment: points
                    }
                }
            }),
            prisma.products.update({
                where: { id: productid },
                data: {
                    stock: {
                        decrement: quantity
                    }
                }
            })
        ]);
        res.status(201).json({ message: "Order update successfully", order, });
    } catch (error) {
        res.json({ message: error });
    }
}

export async function deleteOrder(req: Request, res: Response) {
    let account;
    const id = parseInt(req.params.id);
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        account = verifyToken(token);

        const order = await prisma.order.findUnique({ where: { id } })

        if (!order) {
            res.status(403).json({ message: "Order not Found" });
            return
        }

        if (!account || account.role !== "user") {
            res.status(403).json({ message: "Only user can delete this order" });
            return
        }

        if (account.id !== order?.userid) {
            res.status(403).json({ message: "Only user who order can delete this order" });
            return
        }

        await prisma.order.delete({ where: { id } });

        res.status(201).json({ message: "order deleted successfully", });
    } catch (error) {
        res.json({ message: error });
    }
}

export async function getAllOrder(req: Request, res: Response) {
    let account;
    const { order, limit, offset } = req.query
    const filters: any = {}
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        account = verifyToken(token);

        if (!account || account.role !== "admin") {
            res.status(403).json({ message: "Only admin can see all order" });
            return
        }

        const orders = await prisma.order.groupBy({
            by: ['userid'],
            _sum: {
                Productid: true,
                quantity: true,
                total: true
            },
            orderBy: {
                userid: order === "asc" ? 'asc' : 'desc' // Assuming you want to order by userid
            },
            take: limit ? Number(limit) : undefined,
            skip: offset ? Number(offset) : undefined
        });

        const total = await prisma.order.count()
        res.status(200).json({ data: orders, total })
    } catch (error) {
        res.json({ message: error });
    }
}

export async function getUserOrder(req: Request, res: Response) {
    const { order, limit, offset } = req.query;
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const account = verifyToken(token);
        if (!account) {
            res.status(403).json({ message: "User not authenticated" });
            return;
        }
        const userId = account.id;
        const orders = await prisma.order.findMany({
            where: { userid: userId },
            orderBy: {
                id: order === "asc" ? 'asc' : 'desc'
            },
            take: limit ? Number(limit) : undefined,
            skip: offset ? Number(offset) : undefined
        });
        const total = await prisma.order.count({ where: { userid: userId } });
        res.status(200).json({ data: orders, total });
    } catch (error) {
        res.json({ message: error });
    }
}

export const transferPoint = async (req: Request, res: Response, next: any) => {
    const { amount, receiverId } = req.body
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const account = verifyToken(token);
        if (amount <= 0) {
            res.status(400).json({ message: "Jumlah Point harus lebih dari 0" })
        }

        const [sender, receiver] = await Promise.all([
            prisma.account.findUnique({ where: { id: account.id } }),
            prisma.account.findUnique({ where: { id: receiverId } })
        ])

        if (!sender) {
            res.status(404).json({ message: "Pengirim Tidak Ditemukan," })
            return
        }
        if (!receiver) {
            res.status(404).json({ message: "Penerima Tidak Ditemukan" })
            return
        }

        if (sender.point < amount) {
            res.status(400).json({ message: "Jumlah point tidak cukup" })
        }

        //middleware prisma untuk transaction
        await prisma.$transaction(async (transfer) => {
            await transfer.account.update({
                where: { id: account.id },
                data: { point: { decrement: amount } }
            })
            await transfer.account.update({
                where: { id: receiverId },
                data: { point: { increment: amount } }
            })
            res.json("Transfer Point Berhasil")
        })
    } catch (error) {
        res.status(500).json("interal server error")
    }
}