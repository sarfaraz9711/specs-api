/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import moment = require('moment');
import { IsNotEmpty } from 'class-validator';
import { Product } from './ProductModel';
@Entity('product_discount')
export class ProductDiscount extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'product_discount_id' })
    public productDiscountId: number;
    @IsNotEmpty()
    @Column({ name: 'product_id' })
    public productId: number;

    @Column({ name: 'quantity' })
    public quantity: number;
    @IsNotEmpty()
    @Column({ name: 'sku_id' })
    public skuId: number;

    @Column({ name: 'priority' })
    public priority: number;
    @IsNotEmpty()
    @Column({ name: 'price' })
    public price: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'date_start' })
    public dateStart: Date;

    @Column({ name: 'date_end' })
    public dateEnd: Date;

    @ManyToOne(type => Product, product => product.productSpecial)
    @JoinColumn({ name: 'product_id' })
    public product: Product;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
