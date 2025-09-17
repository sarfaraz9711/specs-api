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
import {BaseModel} from '../BaseModel';
import moment = require('moment');
import { IsEmpty } from 'class-validator';
@Entity('tt_paytm_order')
export class PaytmOrder extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'paytm_ref_id' })
    public paytmRefId: string;

    @Column({ name: 'total' })
    public total: string;

    @Column({ name: 'status' })
    public status: number;

    @IsEmpty()
    @Column({ name: 'txn_id' })
    public trxNo: string;

    @IsEmpty()
    @Column({ name: 'paytm_signature' })
    public paytmSig: string;

    @IsEmpty()
    @Column({ name: 'request_payload' })
    public requestPayload: string;
    
    @IsEmpty()
    @Column({ name: 'response_payload' })
    public responsePayload: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

}
