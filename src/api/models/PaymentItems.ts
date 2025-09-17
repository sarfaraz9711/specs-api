/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { Payment } from './Payment';
import { OrderProduct } from './OrderProduct';
import moment = require('moment');
import { IsNotEmpty } from 'class-validator';
@Entity('payment_items')
export class PaymentItems extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'payment_item_id' })
    public paymentItemId: number;
    @IsNotEmpty()
    @Column({ name: 'order_product_id' })
    public orderProductId: number;
    @IsNotEmpty()
    @Column({ name: 'payment_id' })
    public paymentId: number;
    @IsNotEmpty()
    @Column({ name: 'total_amount' })
    public totalAmount: number;
    @IsNotEmpty()
    @Column({ name: 'product_name' })
    public productName: string;

    @Column({ name: 'product_quantity' })
    public productQuantity: number;
    @IsNotEmpty()
    @Column({ name: 'product_price' })
    public productPrice: number;

    @ManyToOne(type => OrderProduct, orderProduct => orderProduct.paymentItems)
    @JoinColumn({ name: 'order_product_id' })
    public orderProduct: OrderProduct;

    @ManyToOne(type => Payment, payment => payment.paymentItems)
    @JoinColumn({ name: 'payment_id' })
    public payment: Payment;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
