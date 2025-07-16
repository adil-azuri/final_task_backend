import { PrismaClient } from "../generated/prisma";
import { prisma } from "./client";

const Prisma = new PrismaClient();

async function main() {
    await prisma.products.deleteMany();
    await prisma.order.deleteMany();


    const products = await prisma.products.createMany({
        data: [
            { name: "Keyboard", price: 350_000, stock: 20, photo: "null" },
            { name: "Mouse", price: 150_000, stock: 20, photo: "null" },
            { name: "Monitor", price: 1_500_000, stock: 20, photo: "null" },
        ]
    })
}

main()
    .then(() => {
        console.log("Seeding Complete");
    })
    .catch((e) => {
        console.log(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })