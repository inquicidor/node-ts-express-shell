import mongoose from "mongoose";

interface Option{
    mongoUrl:string;
    dbName:string;
}

export class mongoDatabase{

    static async connect(options:Option){

        const {mongoUrl,dbName} = options;

        try {
            
            await mongoose.connect(mongoUrl,{
                dbName:dbName,
            });

            return true;

        } catch (error) {
            console.log(`mongo not conect ${error}`)
            throw error;
        }
    }

    static async disconnect(){
        await mongoose.disconnect();
    }
}