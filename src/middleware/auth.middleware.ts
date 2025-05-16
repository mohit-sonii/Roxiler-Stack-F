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
        const strRole = role as string

        if (req.originalUrl.startsWith("/a")) {

            if (!foundUser || (foundUser.role.toString() !== "ADMIN" && strRole !== "ADMIN")) return;
            next()
        } else if (req.originalUrl.startsWith("/u")) {
            if (!foundUser || (foundUser.role.toString() !== "USER" && strRole !== "USER")) return;
            next();
        } else if (req.originalUrl.startsWith("/o")) {
            if (!foundUser || (foundUser.role.toString() !== "OWNER" && strRole !== "OWNER")) return;
            next();
        } 
        else {
            res.status(400).json({ status: 400, message: "UnExpected Route" })
            return
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: "UnExpected Server Error" })
        console.log(error)
        return;
    }
}