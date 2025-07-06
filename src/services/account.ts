import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { signToken } from "../utility/jwt";

export async function serv_register(name: string, password: string, role: string, profile: string) {
    if (password.length < 6) {
        throw new Error("Invalid password");
    }

    if (!role.match(/admin/) && !role.match(/user/)) {
        throw new Error("Invalid role, role must be admin or user");
    }

    if (!profile) {
        throw new Error("Profile cannot be empty");
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        const account = await prisma.account.create({
            data: { name, password: hashed, role, profile },
        });

        return { id: account.id, name: account.name, role: account.role };
    } catch (error) {
        throw Error("Error creating account ");
    }
}
