

import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { Request, Response } from 'express'
import { prisma } from '../client'

const secretKey = process.env.TOKEN_SECRET || "JavaMohistOOPSLearnCodingNodejsPythonFlaskRustRuby"


export const generateToken = (id: string, role: string, res: Response, req: Request) => {
    const token = jwt.sign(
        { id, role },
        secretKey,
        { expiresIn: '26h' }
    )
    // wanted ot extend the request with user so that we can do the things easily but even after 2 hours of debugging TS error still persist so I am going with the cookies based auth in protected routes
    res.cookie(
        "auth_for_app",
        token,
        {
            httpOnly: true,
            maxAge: 1000 * 24 * 60 * 60,
            sameSite: 'strict'
        }
    )

}
export interface JWT{
    id:string,
    role:Role
}
export const validateToken = (token: string): boolean => {

    const result = jwt.verify(token, secretKey) as JWT
    const {id} = result
    const userWithId = prisma.users.findFirst({
        where:{
            id:id
        },
        select:{
            role:true
        }
    })
    if(!userWithId)return false;
    
    return true

}