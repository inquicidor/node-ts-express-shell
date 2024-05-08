import { NextFunction,Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { error } from "console";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";


export class AuthMiddleware{

    static async validateJWT(req:Request, res:Response, next:NextFunction){

        const authorization = req.header('Authorization');

        if(!authorization)return res.status(401).json({error:'no tocken provided'});
        if(!authorization.startsWith('Bearer '))return res.status(401).json({error:'Invalid beard token'});
        
        const token = authorization.split(' ').at(1)|| '';

        try{
            const payload = await JwtAdapter.validateToken<{id:string}>(token);
            if(!payload) return res.status(401).json({error:'invalid toker'});

            const user = await UserModel.findById(payload.id);
            if(!user) return res.status(401).json({error:'invalid toker-id user'});
            
            req.body.user = UserEntity.fromObject(user);

            //todo

            next();


        }
        catch(error){
            console.log(error);
            res.status(500).json({error:'Internal server error'});
        }
    }

}