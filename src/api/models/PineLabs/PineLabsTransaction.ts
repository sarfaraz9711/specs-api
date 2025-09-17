/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';

@Entity('tt_pine_order_transaction')
export class PineLabsTransaction extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'pine_order_id' })
    public pineOrderId: number;

    @Column({ name: 'payment_type' })
    public paymentType: string;

    @Column({ name: 'payment_data' })
    public paymentData: string;

    @Column({ name: 'payment_status' })
    public paymentStatus: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

}
