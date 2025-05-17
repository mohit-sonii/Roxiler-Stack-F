import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import { prisma } from "../client";
import { Role } from "@prisma/client";

export const dashboardDisplayCounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userCount = await prisma.users.count();
        const storeCount = await prisma.store.count();
        const submittedRatingCount = await prisma.rating.count()
        res.status(200).json({ status: 200, data: [userCount, storeCount, submittedRatingCount], message: "Data Fetched Successfully" })
        return
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(error)
        return
    }
}

export const addStore = async (req: Request, res: Response): Promise<void> => {
    // username,useremail,useraddresss,userpassword, storename,storeaddress,storeemail,storeownerId
    try {
        const { ...rest } = req.body
        for (const i in rest) {
            const value = rest[i]
            if (typeof value === 'string' && value.trim().length === 0) {
                res.status(400).json({ satus: 400, message: "Some required fields are missing !!" })
                return
            }
        }
        let user = await prisma.users.findFirst({
            where: { email: rest.useremail }
        })
        if (!user) {
            user = await prisma.users.create({
                data: {
                    name: rest.username,
                    email: rest.useremail,
                    address: rest.useraddress,
                    password: await bcrypt.hash(rest.userpassword, 10),
                    role: Role.OWNER
                }
            })
        }
        // store email shall be different
        let storeCheck = await prisma.store.findFirst({
            where: {
                OR: [
                    { email: rest.storeemail },
                    { name: rest.storename }
                ]
            }
        })
        if (storeCheck) {
            res.status(403).json({ status: 403, message: "Store with this Email already registered" })
            return
        }
        await prisma.store.create({
            data: {
                name: rest.storename,
                address: rest.storeaddress,
                email: rest.storeemail,
                owner: {
                    connect: {
                        user_id: user.user_id
                    }
                },
            },

        })

        res.status(200).json({ status: 200, message: "Shop has created" })
        return

    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(error)
        return
    }
}

export const listOfStore = async (req: Request, res: Response): Promise<void> => {
    try {
        //shopaddress,shoprating
        const { ...rest } = req.query
        let isAll = true;
        let result;
        for (const i in rest) {
            const value = rest[i]
            if (typeof value === 'string' && value.trim().length !== 0) {
                isAll = false;
                break;
            }
        }

        if (isAll) {
            result = await prisma.store.findMany({
                select: {
                    name: true,
                    email: true,
                    address: true,
                    ratings: {
                        select: {
                            rating: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            })
        }
        else {
            result = await prisma.store.findMany({
                where: {
                    address: {
                        contains: rest.storeaddress as string
                    }
                },
                select: {
                    ratings: {
                        select: {
                            rating: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    name: true,
                    address: true,
                    email: true
                }
            })
        }

        res.status(200).json({ status: 200, data: result[0], message: "Data Fetched Successfully" })
        return

    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(error)
        return
    }
}

export const listOfUser = async (req: Request, res: Response): Promise<void> => {
    try {
        //username,usermail,useraddress,userrole
        const { ...rest } = req.query
        let isAll = true;
        let result;
        for (const i in rest) {
            const value = rest[i]
            if (typeof value === 'string' && value.trim().length !== 0) {
                isAll = false;
                break;
            }
        }

        if (isAll) {
            result = await prisma.users.findMany({
                where: {
                    OR: [
                        { role: Role.ADMIN },
                        { role: Role.USER }
                    ]
                },
                select: {
                    name: true,
                    email: true,
                    address: true,
                    role: true
                }
            })
        }
        else {
            result = await prisma.users.findMany({
                where: {
                    AND: [
                        rest.username ? {
                            name: {
                                contains: rest.username as string,
                                mode: 'insensitive'
                            }
                        } : {},
                        rest.usermail ? {
                            email: {
                                contains: rest.usermail as string,
                                mode: 'insensitive'
                            }
                        } : {},
                        rest.useraddress ? {
                            address: {
                                contains: rest.useraddress as string,
                                mode: 'insensitive'
                            }
                        } : {},
                        rest.userrole ? {
                            role: rest.userrole as Role
                        } : {}
                    ]
                },
                select: {
                    name: true,
                    address: true,
                    role: true,
                    email: true
                }
            })
        }
        res.status(200).json({ status: 200, data: result[0], message: "Data Fetched Successfully" })
        return
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(error)
        return
    }
}