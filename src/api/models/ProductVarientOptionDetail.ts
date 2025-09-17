/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { ProductVarientOption } from './ProductVarientOption';
import { VarientsValue } from './VarientsValue';
import moment = require('moment');
import { IsNotEmpty } from 'class-validator';
@Entity('product_varient_option_details')
export class ProductVarientOptionDetail extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'product_varient_option_id' })
    public productVarientOptionId: number;
    @IsNotEmpty()
    @Column({ name: 'varients_value_id' })
    public varientsValueId: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @ManyToOne(type => ProductVarientOption, productVarientOption => productVarientOption.productVarientOptionDetail)
    @JoinColumn({ name: 'product_varient_option_id' })
    public productVarientOption: ProductVarientOption;

    @ManyToOne(type => VarientsValue, varientsValue => varientsValue.productVarientOptionDetail)
    @JoinColumn({ name: 'varients_value_id' })
    public varientsValue: VarientsValue;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
