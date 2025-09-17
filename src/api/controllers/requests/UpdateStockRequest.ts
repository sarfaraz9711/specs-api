/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {IsNotEmpty} from 'class-validator';

export interface ProductStock {
    skuId?: number;
    outOfStockThreshold?: number;
    notifyMinQuantity?: number;
    minQuantityAllowedCart?: number;
    maxQuantityAllowedCart?: number;
    enableBackOrders?: number;
}

export class UpdateStockRequest {

    @IsNotEmpty()
    public productId: number;
    public hasStock: number;
    public productStock: ProductStock[];
}
