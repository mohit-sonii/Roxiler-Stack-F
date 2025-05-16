
import { Response, Request } from "express"
import { prisma } from "../client";
import bcrypt from 'bcrypt'
import { generateToken, validateToken } from "../utils/tokenCookie";


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { ...rest } = req.body
    for (const i in rest) {
        const value = rest[i]
        if (typeof value === 'string' && value.trim().length === 0) {
            res.status(400).json({ satus: 400, message: "Some required fields are missing !!" })
            return
        }
    }
    try {
        const foundUser = await prisma.users.findFirst({
            where: {
                email: rest.email
            }
        })
        if (foundUser) {
            res.status(409).json({ status: 409, message: "User with this email already exists !!" })
            return
        }
        const hashedPassword = await bcrypt.hash(rest.password, 10);

        const newUser = await prisma.users.create({
            data: {
                name: rest.username,
                email: rest.email,
                address: rest.address,
                password: hashedPassword
            }
        })
        generateToken(newUser.id, "USER", res, req);

        res.status(201).json({ status: 201, message: "User Created Successfully" })
        return
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(error)
        return
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        if (email.trim().length === 0 || password.trim().length=== 0) {
            res.status(400).json({ status: 400, message: "Either email or password is incorrect" })
            return
        }

        const hasToken = req.cookies?.auth_for_app
        if (hasToken) {
            try {
                if (validateToken(hasToken)) {
                    res.status(200).json({ status: 200, message: "User Authenticated" })
                    return
                }
                res.status(401).json({ status: 401, message: "Not Authenticated" })
                return
            } catch (erorr) {
                res.status(500).json({ status: 500, message: "Unexpected Authentication Error" })
                console.log(erorr)
                return
            }
        }
        const foundUser = await prisma.users.findFirst({
            where: {
                email
            }
        })
        if (!foundUser) {
            res.status(404).json({ status: 404, message: "User not found" });
            return
        }
        if (await bcrypt.compare(password, foundUser.password)) {
            generateToken(foundUser.id, "USER", res, req);
            res.status(200).json({ status: 200, message: "User Authenticated" })
            return
        } else {
            res.status(401).json({ status: 401, message: "Incorrect email or password" })
            return
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Erorr" })
        console.log(error)
        return
    }

}