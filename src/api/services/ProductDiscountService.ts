/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { ProductDiscount } from '../models/ProductDiscount';
import { ProductDiscountRepository } from '../repositories/ProductDiscountRepository';

@Service()
export class ProductDiscountService {
    constructor(
        @OrmRepository() private productDiscountRepository: ProductDiscountRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(Data: any): Promise<ProductDiscount> {
        this.log.info('create a data');
        return this.productDiscountRepository.save(Data);
    }
    // findone a data
    public findOne(id: any): Promise<ProductDiscount> {
        this.log.info('Find a data');
        return this.productDiscountRepository.findOne(id);
    }

    // findone a data
    public findOneValue(id: any): Promise<ProductDiscount> {
        this.log.info('Find a data');
        return this.productDiscountRepository.findOne(id);
    }
    // find a data
    public findAll(productDiscount: any): Promise<ProductDiscount[]> {
        this.log.info('Find a data');
        return this.productDiscountRepository.find(productDiscount);
    }

    // find a data
    public find(): Promise<ProductDiscount[]> {
        this.log.info('Find a data');
        return this.productDiscountRepository.find();
    }
    // delete product option
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a product option');
        const deleteProductDiscount = await this.productDiscountRepository.delete(id);
        return deleteProductDiscount;
    }

    // find special price
    public async findDiscountPrice(productId: number, todayDate: string): Promise<any> {
        return await this.productDiscountRepository.findDiscountPrice(productId, todayDate);
    }

    // find discount price with sku
    public async findDiscountPricewithSku(productId: number, skuId: number, todayDate: string): Promise<any> {
        return await this.productDiscountRepository.findDiscountPricewithSku(productId, skuId, todayDate);
    }
    public update(id: any, product: ProductDiscount): Promise<ProductDiscount> {
        this.log.info('Update a product', id, product);
        console.log("product id and detail",id,product);
        product.productId = id;
        return this.productDiscountRepository.save(product);
    }
}
