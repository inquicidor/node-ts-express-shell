import { Request,Response } from "express";
import { CustomError, LoginUserDto, RegisterUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";
import { json } from "stream/consumers";


export class AuthController{

    constructor(
        public readonly authService: AuthService,
    ){}

    private handlerError = (error:unknown, res: Response)=>{
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({error: error.message});
        }

        console.log(`${error}`);
        return res.status(500).json({error: 'internal server error'});
    }


    registerUser = (req:Request, res:Response)=>{
        const [error, registerDto] = RegisterUserDto.create(req.body);
    
        if(error) return res.status(400).json({error});

        this.authService.regsiterUser(registerDto!)
        .then((user)=>res.json(user))
        .catch(error => this.handlerError(error, res));
    };

    loginUser = (req:Request, res:Response)=>{

        console.log(req);
        console.log(req.body);
        const [error, loginUserDto] = LoginUserDto.create(req.body);
        if(error) return res.status(400).json({error});

        this.authService.loginUser(loginUserDto!)
        .then((user)=>res.json(user))
        .catch(error => this.handlerError(error, res));
    };

    validateEmail = (req:Request, res:Response)=>{
        const {token} = req.params;

        this.authService.validateEmail(token)
        .then(()=> res.json('Email validate'))
        .catch(error => this.handlerError(error, res));
    };

}