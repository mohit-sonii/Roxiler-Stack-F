
import { Response, Request } from "express"
import { prisma } from "../client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateToken, JWT, validateToken } from "../utils/tokenCookie";
import { secretKey } from "../utils/Key";
import { Role } from "@prisma/client";


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

        await prisma.users.create({
            data: {
                name: rest.username,
                email: rest.email,
                address: rest.address,
                password: hashedPassword,
                role:rest.role as Role
            }
        })
        // generateToken(newUser.user_id, "USER", res, req);

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
        if (email.trim().length === 0 || password.trim().length === 0) {
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
            generateToken(foundUser.user_id, "USER", res, req);
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


export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { newPass, confirmPass } = req.body;
        if (newPass.trim().length === 0 || confirmPass.trim().length === 0 && newPass !== confirmPass) {
            res.status(400).json({ status: 400, message: "Password does not match" })
            return
        }
        const { id } = req.params
        const hashNewPass = await bcrypt.hash(newPass, 10);
        await prisma.users.update({
            where: {
                user_id: id
            },
            data: {
                password: hashNewPass
            }
        })
        res.status(200).json({ status: 200, message: "Password Updated" })
        return
    } catch (error) {
        res.status(500).json({ status: 500, message: "Unexpected Server Error" })
        console.log(error)
        return
    }
}

export const viewListedStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const stores = await prisma.store.findMany({
            select: {
                store_id: true,
                name: true,
                owner: {
                    select: {
                        name: true
                    }
                }
            }
        })
        res.status(200).json({ status: 200, stores })
        return
    } catch (error) {
        res.status(500).json({ status: 500, message: "Unexpected Server Error" })
        console.log(error)
        return
    }
}


export const searchStore = async (req: Request, res: Response): Promise<void> => {
    const { storeName, storeAddress } = req.query
    try {
        const result = await prisma.store.findMany({
            where: {
                AND: [
                    storeName ? {
                        name: {
                            contains: storeName as string,
                            mode: 'insensitive'
                        }
                    } : {},
                    storeAddress ? {
                        address: {
                            contains: storeAddress as string,
                            mode: 'insensitive'
                        }
                    } : {}
                ]
            },
            select: {
                store_id: true,
                name: true,
                address: true,
                ratings: {
                    select: {
                        rating_id: true,
                        rating: true,
                        userId: true
                    }
                },
            }
        })
        res.status(200).json({ status: 200, result });
        return;
    } catch (erorr) {
        res.status(500).json({ status: 500, erorr });
        return;
    }

}

export const updateRating = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ratingId } = req.params
        const { newRating } = req.body
        if (newRating > 5 || newRating < 0) {
            res.status(400).json({ status: 400, message: "Please provide rate betwen 1 and 5" })
            return;
        }
        await prisma.rating.update({
            where: {
                rating_id: ratingId
            },
            data: {
                rating: newRating
            }
        })

        res.status(200).json({ status: 200, message: "Ratings updated successfully" })
        return
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(error)
        return
    }
}

export const rateStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { proRating } = req.body
        if (proRating > 5 || proRating < 0) {
            res.status(400).json({ status: 400, message: "Please provide rate betwen 1 and 5" })
            return;
        }
        const decode = jwt.verify(req.cookies.auth_for_app, secretKey) as JWT;
        const { id } = decode //this is user id

        const isPresent = await prisma.rating.findUnique({
            where: {
                userId_storeId: {
                    userId: id,
                    storeId
                }
            }
        })
        if (isPresent) {
            res.status(403).json({ status: 403, message: "User already rated" })
            return;
        }
        try {
            await prisma.rating.create({
                data: {
                    rating: proRating,
                    userId: id,
                    storeId
                }
            })
            res.status(200).json({ status: 200, message: "Rating Added. Thanks" })
            return
        } catch (erro) {
            res.status(500).json({ status: 500, message: "Error while performing your request" })
            return
        }
    } catch (err) {
        res.status(500).json({ status: 500, message: "Internal Server Error" })
        console.log(err)
        return
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("auth_for_app", {
        httpOnly: true,
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
}