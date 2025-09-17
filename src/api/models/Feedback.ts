/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

// import * as bcrypt from 'bcrypt';
// import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsEmail } from 'class-validator';
import {
     Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate
} from 'typeorm';

//import { UserGroup } from './UserGroup';
 import {BaseModel} from './BaseModel';
 import moment from 'moment';
//import {AccessToken} from './AccessTokenModel';

@Entity('rc_feedback')
export class Feedback extends BaseModel {

   
    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;

    @IsEmail()
    @Column({ name: 'email' })
    public email: string;
	
	@IsNotEmpty()
    @Column({ name: 'feedMsg' })
    public feedMsg: string;
	
	@IsNotEmpty()
    @Column({ name: 'type' })
    public type: string;
	
	@BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }


}
