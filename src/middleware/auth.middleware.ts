import { Request,Response,NextFunction } from "express";
import { prisma } from "../client";
import jwt from 'jsonwebtoken'
import { JWT } from "../utils/tokenCookie";

export const middleware = async(req:Request,res:Response,next:NextFunction)=>{

    try{
        const token = req.cookies?.auth_for_app
        if(!token){
            res.status(401).json({status:401,message:"Unauthorized"})
            return;
        }
        const decode = jwt.verify(token,process.env.TOKEN_SECRET_KEY || "JavaMohistOOPSLearnCodingNodejsPythonFlaskRustRuby")as JWT
        const {id,role} =decode
        const foundUser = await prisma.users.findFirst({
            where:{
                id:id
            },
            select:{
                role:true
            }
        })
        if(!foundUser || (foundUser.role!=="ADMIN" && role!=="ADMIN"))return;
        next();

    }catch(error){
        res.status(500).json({status:500,message:"UnExpected Server Error"})
        console.log(error)
        return;
    }
}