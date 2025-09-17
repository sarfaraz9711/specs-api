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

@Entity('permission_module_group')
export class PermissionModuleGroup extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'module_group_id' })
    public moduleGroupId: number;
    @IsNotEmpty()
    @Column({ name: 'name' })
    public name: string;
    @IsNotEmpty()
    @Column({ name: 'slug_name' })
    public slugName: string;

    @Column({ name: 'sort_order' })
    public sortOrder: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
