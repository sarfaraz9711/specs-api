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
     Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';

//import { UserGroup } from './UserGroup';
// import {BaseModel} from './BaseModel';
// import moment from 'moment';
//import {AccessToken} from './AccessTokenModel';

@Entity('rc_enquiry')
export class Enquiry {

   
    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;

    @IsEmail()
    @Column({ name: 'Email' })
    public Email: string;
	
	@IsNotEmpty()
    @Column({ name: 'Mobile_no' })
    public Mobile_no: string;
	
	@IsNotEmpty()
    @Column({ name: 'Name' })
    public Name: string;
	
	@IsNotEmpty()
    @Column({ name: 'Company_name' })
    public Company_name: string;
	
	@IsNotEmpty()
    @Column({ name: 'City' })
    public City: string;
	
	@IsNotEmpty()
    @Column({ name: 'Product_quantity' })
    public Product_quantity: string;
	
	@IsNotEmpty()
    @Column({ name: 'Requirement' })
    public Requirement: string;
	
}
