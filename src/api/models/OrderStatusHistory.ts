/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import moment from 'moment';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { IsNotEmpty } from 'class-validator';
@Entity('order_status_history')
export class OrderStatusHistory extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'order_prefix_id' })
    public orderPrefixId: string;

    @Column({ name: 'order_product_id' })
    public orderProductId: number;

    @Column({ name: 'order_status_name' })
    public orderStatusName: string;

    @Column({ name: 'order_status_id' })
    public orderStatusId: number;

    @Column({ name: 'active' })
    public active: number;

    @Column({ name: 'completed' })
    public completed: number;

    @Column({ name: 'sequence' })
    public sequence: number;
    
    @Column({ name: 'action_date' })
    public actionDate: string;
    
    @Column({ name: 'status_code_remark' })
    public statusCodeRemark: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
