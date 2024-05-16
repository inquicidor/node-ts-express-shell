import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";



export class AuthService{

    constructor(
        private readonly emailSevice:EmailService,
    ){}

    public async regsiterUser(regsiterUserDto:RegisterUserDto){

        const existUser = await UserModel.findOne({email: regsiterUserDto.email});
        if(existUser) throw CustomError.badRequest('Email already exist');

        try {
            const user = new UserModel(regsiterUserDto);


            user.password =  bcryptAdapter.hash(regsiterUserDto.password);
            await user.save();

            await this.sendEmailValidation(user.email);

            const {password, ...userEntity} = UserEntity.fromObject(user);
            const token = await JwtAdapter.generateToken({ id: user.id });
            return {
                user:{userEntity},
                token:token
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }

    }

    public async loginUser(loginUserDto:LoginUserDto){


        const user = await UserModel.findOne({email:loginUserDto.email});

        if(!user) throw CustomError.badRequest('Email not exist');
        const hastMatching = bcryptAdapter.compare(loginUserDto.password, user.password)
        
        if(!hastMatching) throw CustomError.badRequest('password is not valid');
        const {password, ...userEntity} =UserEntity.fromObject(user);

        const token = await JwtAdapter.generateToken({
            id: user.id,
            email: user.email,
        });

        if(!token) throw CustomError.internalServer('Error while create JWT');

        return {
            user:{userEntity},
            token: token,
        }

    }

    private sendEmailValidation = async(email:string)=>{
        const token = await JwtAdapter.generateToken({email,});
        
        if(!token) throw CustomError.internalServer('Error getting token');

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

        const html = `
            <h1>validate your email</h1>
            <p>click to validate email</p>
            <a href="${link}">validate</a>
        `;

        const options ={
            to:email,
            subject:'Validate your email',
            htmlBody: html,
        }

        const isSent = await this.emailSevice.sendEmail(options);

        if(!isSent)throw CustomError.internalServer('Error sneding email');

        return true;

        
    }

    public validateEmail = async(token:string)=>{
        const payload = await JwtAdapter.validateToken(token);
        if(!payload) throw CustomError.unathorized('invalid toke');

        const {email} = payload as {email:string};
        if(!email) throw CustomError.internalServer('email not in token');
        
        const user = await UserModel.findOne({email});
        if(!user) throw CustomError.internalServer('email not exist');

        user.emailValidated = true;
        await user.save();
        return true;
    }
}