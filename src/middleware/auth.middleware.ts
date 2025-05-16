import { Request, Response, NextFunction } from "express";
import { prisma } from "../client";
import jwt from 'jsonwebtoken'
import { JWT } from "../utils/tokenCookie";



const secretKey = process.env.TOKEN_SECRET || "JavaMohistOOPSLearnCodingNodejsPythonFlaskRustRuby"

export const middleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = req.cookies?.auth_for_app
        if (!token) {
            res.status(401).json({ status: 401, message: "Unauthorized" })
            return;
        }
        const decode = jwt.verify(token, secretKey) as JWT
        const { id, role } = decode
        const foundUser = await prisma.users.findFirst({
            where: {
                user_id: id
            },
            select: {
                role: true
            }
        })
        if (req.originalUrl.startsWith("/a")) {

            if (!foundUser || (foundUser.role !== "ADMIN" && role !== "ADMIN")) return;
            next()
        } else if (req.originalUrl.startsWith("/u")) {
            if (!foundUser || (foundUser.role !== "USER" && role !== "USER")) return;
            next();
        } else {
            res.status(400).json({ status: 400, message: "UnExpected Route" })
            return
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: "UnExpected Server Error" })
        console.log(error)
        return;
    }
}