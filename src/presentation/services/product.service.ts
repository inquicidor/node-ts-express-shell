import {ProductModel } from "../../data";
import { CreateProductDto, CustomError, UserEntity } from "../../domain";
import { PaginationDto } from "../../domain/dtos/shared/pagination.dtos";



export class ProductService{

    constructor(){}

    async createProduct(createProduct:CreateProductDto){
        
        const productExists = await ProductModel.findOne({
            name:CreateProductDto.name
        });

        if(productExists) throw CustomError.badRequest('product already exist');

        try {
            const product = new ProductModel(
                {
                    ...createProduct,
                }
            );

            await product.save();

            return product;

        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }

    }

    async getProducts(paginationDto:PaginationDto){

        const {page, limit } = paginationDto;
        try {
            const [total, products] = await Promise.all
            ([
                ProductModel.countDocuments(),
                ProductModel.find()
                .skip((page-1)*limit)
                .limit(limit)
                .populate('user')
                .populate('category')
            ]);
            
            return {
                page:page,
                limit:limit,
                total:total,
                next:`/api/products?page=${(page+1)}&limit=${limit}`,
                prev:(page -1 > 0)?`/api/products?page=${(page-1)}&limit=${limit}`:null,

                products:products,
            };

        } catch (error) {
            throw CustomError.internalServer('internal server error');
        }
    }
}