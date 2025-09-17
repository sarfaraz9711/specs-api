/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('tm_discount_offer')
export class DiscountOffer extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'product_ids' })
    public productIds: string;
    
    @Column({ name: 'enc_code' })
    public encCode: string;
    
    @Column({ name: 'url' })
    public url: string;

    @Column({ name: 'discount' })
    public discount: number;
    
    @Column({ name: 'start_date' })
    public startDate: string;
    
    @Column({ name: 'end_date' })
    public endDate: string;

    @Column({ name: 'status' })
    public status: number;
    

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
