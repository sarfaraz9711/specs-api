/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('tax')
export class Tax extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'tax_id' })
    public taxId: number;
    @IsNotEmpty()
    @Column({ name: 'tax_name' })
    public taxName: string;
    @Column({ name: 'tax_percentage' })
    public taxPercentage: number;
    @IsNotEmpty()
    @Column({ name: 'tax_status' })
    public taxStatus: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
