/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { VendorCoupon } from './VendorCoupon';
import { IsNotEmpty } from 'class-validator';

@Entity('coupon_product_category')
export class VendorCouponProductCategory extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'vendor_coupon_id' })
    public vendorCouponId: number;
    @IsNotEmpty()
    @Column({ name: 'type' })
    public type: number;

    @Column({ name: 'reference_id' })
    public referenceId: number;

    @ManyToOne(type => VendorCoupon, vendorCoupon => vendorCoupon.vendorCouponProductCategory)
    @JoinColumn({ name: 'vendor_coupon_id' })
    public vendorCoupon: VendorCoupon;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
