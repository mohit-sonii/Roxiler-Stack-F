import { Request, Response } from "express"
import { prisma } from "../client"
import { Role } from "@prisma/client"
import { generateToken, JWT } from "../utils/tokenCookie"
import bcrypt from 'bcrypt'

export const loginOwner = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        if (email.trim().length === 0 || password.trim().length === 0) {
            res.status(400).json({ status: 400, message: "Either email or password is incorrect" })
            return
        }
        const owner = await prisma.users.findFirst({
            where: {
                email,
                role: 'OWNER' as Role
            },
            select: {
                user_id: true,
                password: true,
                stores: true
            }
        })
        if (!owner) {
            res.status(404).json({ status: 404, message: "No Shop Found, Contact the admin" })
            return
        }
        if (!await bcrypt.compare(password, owner.password)) {
            res.status(401).json({ status: 401, message: "Either email or password is incorrect" })
            return
        }

        generateToken(owner.user_id, "OWNER", res, req);

    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Erorr" })
        console.log(err)
        return
    }
}

export const dashboardMethod = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    try {
        const result = await prisma.store.findMany({
            where: {
                ownerId: id
            },
            select: {
                ratings: {
                    select: {
                        rating: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                address: true
                            }
                        }
                    }
                }
            }
        })
        let total_users = 0;
        let sum_rating = 0;
        let userList: {
            name: string,
            email: string,
            address: string
        }[] = []
        result[0].ratings.map((item) => {
            sum_rating += item.rating;
            total_users++;
            userList.push(item.user)
        })
        const average_rating = Math.ceil(sum_rating / total_users);
        res.status(200).json({ status: 200, data: [userList, average_rating], message: "Data Fetched Successfully" })
        return;
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Erorr" })
        console.log(err)
        return
    }

}