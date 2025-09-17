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
@Entity('whatsapp')
export class WhatsApp extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_id' })
    public orderId: string;

    @Column({ name: 'customer_id' })
    public customerId: number;

    @Column({ name: 'template_id' })
    public templateId: string;

    @Column({ name: 'order_status_id' })
    public orderStatusId: number;

    @Column({ name: 'status' })
    public status: string;

    @Column({ name: 'request' })
    public request: string;

    @Column({ name: 'response' })
    public response: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
