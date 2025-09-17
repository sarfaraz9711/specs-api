import { Body, Get, JsonController, Param, Post, QueryParams } from 'routing-controllers';

import { getManager } from 'typeorm';
import { DiscountOffer } from '../../models/DiscountOffer';
import {discount} from '../../../env'
@JsonController('/discount')
export class DiscountOfferController {
    constructor() { }

    @Get('/all-discount-products')
    public async getAllDiscountProduct(@QueryParams() percentage:any): Promise<any> {
        const result = await getManager().createQueryBuilder('product','p')
        .select(['max(p.discount) AS discount', 'p.upc as upc' , 'max(p.name) as productName', 'p.product_id as productId', 'max(pi.image) as image', 'max(pi.container_name) as path'])
        .innerJoin('product_image','pi', 'pi.product_id=p.product_id')
        .where('p.discount>= :percentMin', {percentMin: percentage.min})
        .andWhere('p.discount<= :percentmax', {percentmax: percentage.max})
        .andWhere('p.discount!=0')
        .andWhere('p.is_active=1')
        .groupBy('productId')
        .addGroupBy('upc')
        .getRawMany();
       return result
    }




    @Post('/generate-url')
    public async generateUrl(@Body() request:any):Promise<any>{
        const requestJson:any =request 
        requestJson.status = 1
        const _discount = getManager().getRepository(DiscountOffer)
        const result = await _discount.save(requestJson)
        // const encUrl = this.encrptData(result.id.toString())
        const url = discount.discountUrl+`offer-discount?attribute=&priceFrom=0&priceTo=10000&brand=&variantValue=&defaultCallValue=DESC&offset=0&index=0&categorySlug=offer-discount&discountOfferId=${result.id}&categoryId=&sizeValueFilter=&colorsValueFilter=&finalFilteredQueryparams=&paramsForRating=rating%3D&productDiscountPercent=`
        await _discount.createQueryBuilder().update().set({url:url}).where("id=:id", {id: result.id}).execute();
        return result
    }

    public encrptData(input:any):any {
        let s = "";
        let d = "";
        s = Buffer.from('hash2 keyword uses for the encryption as string',"utf8").toString('base64');
        s = s.replace(/a/g,'aTmopp');
        d = input;
         d = s+"#s-r"+Buffer.from(d,"utf8").toString('base64')+"?p-r"+Buffer.from('encryption',"utf8").toString('base64');
         d = Buffer.from(d,"utf8").toString('base64');
        return d;
    }

    @Get('/get-all-offer')
    public async getAllActiveOfferList():Promise<any>{
        const _discount = getManager().getRepository(DiscountOffer)
        const result = await _discount.find({
            where: {status:1}
        })
        return result
    }

    @Get('/update-status/:id')
    public async updateStatus(@Param("id") id:any):Promise<any>{
        const _discount = getManager().getRepository(DiscountOffer)
         await _discount.createQueryBuilder().update().set({status:0}).where("id=:id", {id: id}).execute();
         const result = await this.getAllActiveOfferList()
        return { status: 1, 
                message: "Successfully Delete the record",
                data: result
                } 
    }

}