/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

// import * as bcrypt from 'bcrypt';
// import { Exclude } from 'class-transformer';
import { IsNotEmpty} from 'class-validator';
import {
     Column, Entity, PrimaryGeneratedColumn,BeforeInsert,BeforeUpdate
} from 'typeorm';
import { BaseModel } from './BaseModel';

//import { UserGroup } from './UserGroup';
// import {BaseModel} from './BaseModel';
 import moment from 'moment';
//import {AccessToken} from './AccessTokenModel';

@Entity('rc_customer_preference')
export class CustomerPreference extends BaseModel  {

   
    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;

    @Column({ name: 'customer_id' })
    public customer_id: number;
	
    @Column({ name: 'customer_preference' })
    public customer_preference: string;

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
