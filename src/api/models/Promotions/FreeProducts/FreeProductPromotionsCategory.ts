/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from '../../BaseModel';
import moment = require('moment/moment');
import { FreeProductsPromtions } from './FreeProductsPromotions';
import { IsNotEmpty } from 'class-validator';

@Entity('tt_free_products_promotions_category')
export class FreeProductsPromotionsCategory extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsNotEmpty()
    @Column({ name: 'promotion_fk_id' })
    public promtionId: number;

    
    @Column({ name: 'buy_product_id' })
    public buyProductId: number;

    @Column({ name: 'get_product_id' })
    public getProductId: number;

    @ManyToOne(type => FreeProductsPromtions, FreeProductsPromtions => FreeProductsPromtions.freeProductsPromotionsCategory)
    @JoinColumn({ name: 'promotion_fk_id' })
    public FreeProductsPromtions: FreeProductsPromtions;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
