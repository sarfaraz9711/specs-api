/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {  Post, Body, JsonController, Authorized, Get, Param, QueryParams } from 'routing-controllers';
import { getManager } from 'typeorm';
import { CategoryImageModel } from '../models/CategoryImageModel';


@JsonController('/category-image')
export class BlogController {
    categoryModel:any
    constructor() {
        this.categoryModel = getManager().getRepository(CategoryImageModel)
    }
     
@Post('/add')
@Authorized()
public async addCategoryImage(@Body() request:any){
    let response:any={}
    const checkResult:any = await this.categoryModel.find({where:{categoryId:request.categoryId, type:request.type}}) 
    if(!request.id && checkResult && checkResult.length>0){
        response.status=300
        response.data=null
        response.message=`Selected category record already available`
    }else{
if(request.type=='Product Flash Image'){
    const whereCondition:any = request.categoryId=='ALL'?'':`WHERE c.category_id = ${request.categoryId}`
    const imagePath:any =request.isActive=='Active'?request.imagePath:null
        await getManager().query(`UPDATE product p INNER JOIN product_to_category ptc ON p.product_id = ptc.product_id INNER JOIN category c ON ptc.category_id = c.category_id SET p.flash_image = ${imagePath?`'${imagePath}'`:null} ${whereCondition};`)
}
    const result:any = await this.categoryModel.save(request)
    response.status=200
        response.data=result
        response.message=`Record successfully added`
    }

    return response
}

@Get('/list')
@Authorized()
public async listCategoryImage(){
    const checkResult:any = await this.categoryModel.find() 
    console.log("checkResult",checkResult)
    let response:any={}
    response.status=200
        response.data=checkResult
        response.message=`Record successfully added`
    
    return response
}

@Get('/get-list-by-category-id/:categoryId')
public async getListCategoryId(@Param('categoryId') categoryId: number){
    const checkResult:any = await this.categoryModel.findOne({where:{categoryId}}) 
    let response:any={}
    response.status=200
        response.data=checkResult
        response.message=`get the record`
    
    return response
}

@Get('/get-list-by-category-id-type')
public async getListCategoryIdType(@QueryParams() data: any){
    let response:any={}
    try{
    const checkResult:any = await this.categoryModel.findOne({where:{categoryId:data.categoryId,type:data.type}}) 
    if(checkResult){
    response.status=200
        response.data=checkResult
        response.message=`get the record`
    }else{
        response.status=300
        response.data=null
        response.message=`No Record found`        
    }
    }catch{
        response.status=300
        response.data=null
        response.message=`No Record found in catch`
    }
    return response
}
    
@Get('/get-active-category')
public async getActiveCategory(){
    const result = await getManager().query(`SELECT name, category_id, category_slug FROM category WHERE is_active=1`)

    return {
        status:200,
        data:result,
        message:`get the record`
    }
}

@Get('/get-child-active-category/:categoryId')
public async getChildActiveCategory(@Param('categoryId') categoryId: number){
    const result = await getManager().query(`SELECT name, category_id categoryId, category_slug categorySlug FROM category WHERE is_active=1 and parent_int=${categoryId}`)

    return {
        status:200,
        data:result,
        message:`get the record`
    }
}

}
