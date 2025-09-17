/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, PrimaryGeneratedColumn, Entity, BeforeUpdate, BeforeInsert } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';
@Entity('contact')
export class Contact extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn()
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'name' })
    public name: string;
    @IsNotEmpty()
    @Column({ name: 'email' })
    public email: string;
    @IsNotEmpty()
    @Column({ name: 'phone_number' })
    public phoneNumber: string;
    @IsNotEmpty()
    @Column({ name: 'message' })
    public message: string;

    @Column({ name: 'is_active' })
    public isActive: number;
    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
