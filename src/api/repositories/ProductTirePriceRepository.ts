/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';
import { ProductTirePrice } from '../models/ProductTirePrice';

@EntityRepository(ProductTirePrice)
export class ProductTirePriceRepository extends Repository<ProductTirePrice>  {
    public async findTirePrice(productId: number, skuId: string, quantity: number): Promise<any> {

        const query: any = await this.manager.createQueryBuilder(ProductTirePrice, 'productTirePrice');
        query.select(['productTirePrice.price as price', 'productTirePrice.quantity as quantity', 'productTirePrice.productId as productId']);
        query.where('productTirePrice.productId = ' + productId);
        query.where('productTirePrice.skuId = ' + skuId);
        query.andWhere('productTirePrice.quantity <= ' + quantity);
        query.orderBy('productTirePrice.quantity', 'DESC');
        query.limit('1');
        return query.getRawOne();
    }
}
