/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn} from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('employee_discount_claim')
export class EmployeeDiscountClaim extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'employee_mobile_no' })
    public employeeMobileNo: string;

    @Column({ name: 'customer_id' })
    public customerId: number;

    @Column({ name: 'order_prefix_id' })
    public orderPrefixId: string;

    @Column({ name: 'order_amount' })
    public orderAmount: number;

    @Column({ name: 'discount_amount' })
    public discountAmount: number;

    @Column({ name: 'coupon_name' })
    public couponName: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('DD-MM-YYYY HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('DD-MM-YYYY HH:mm:ss');
    }
}
