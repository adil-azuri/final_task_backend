import { prisma } from "../prisma/client";

export async function photo_product(id: number, photo: string) {
    const product = await prisma.products.findUnique({ where: { id } });

    if (!product) throw new Error("User not found");

    const update = await prisma.products.update({
        where: { id },
        data: { photo },
    });

    return { id: update.id, photo: update.photo };
}