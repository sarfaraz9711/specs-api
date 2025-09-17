/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseModel } from '../../BaseModel';
import moment = require('moment/moment');
//import { VendorCouponProductCategory } from './VendorCouponProductCategory';
//import { CouponUsage } from './CouponUsage';
import { FreeProductsPromotionsCategory } from './FreeProductPromotionsCategory';
import { IsNotEmpty } from 'class-validator';

@Entity('tm_freeproductpromotions')
export class FreeProductsPromtions extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'promotion_id' })
    public promtionId: number;
    @IsNotEmpty()

    @Column({ name: 'free_promotion_type' })
    public freePromotioType: string;
    @IsNotEmpty()

    @Column({ name: 'start_date' })
    public startDate: string;

    @Column({ name: 'end_date' })
    public endDate: string;

    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'promotion_percentage_discount' })
    public percentageDiscount: number;

    @Column({ name: 'promotion_discount_Amount' })
    public discouctAmount: number;

    @OneToMany(type=> FreeProductsPromotionsCategory, FreeProductsPromotionsCategory => FreeProductsPromotionsCategory.FreeProductsPromtions)
    public freeProductsPromotionsCategory: FreeProductsPromotionsCategory[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
