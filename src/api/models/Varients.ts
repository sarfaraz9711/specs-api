/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { VarientsValue } from './VarientsValue';
import moment = require('moment');
import { ProductVarient } from './ProductVarient';
import { IsNotEmpty } from 'class-validator';
@Entity('varients')
export class Varients extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'type' })
    public type: string;
    @IsNotEmpty()
    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'sort_order' })
    public sortOrder: number;

    @Column({ name: 'category' })
    public category: string;

    @Column({ name: 'varient_display_name' })
    public varientDisplayName: string;

    @OneToMany(type => VarientsValue, varientsValue => varientsValue.varients)
    public varientsValue: VarientsValue[];

    @OneToMany(type => ProductVarient, productVarient => productVarient.varients)
    public productVarient: ProductVarient[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
