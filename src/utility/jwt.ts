import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

//user token
export interface UserPayload {
    id: number;
    name: string;
    role: string;
}
export function signToken(payload: UserPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

}



export function verifyToken(token: string) {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
}