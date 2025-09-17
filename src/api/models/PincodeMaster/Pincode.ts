/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

// import * as bcrypt from 'bcrypt';
// import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import {
     Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';
@Entity('tm_pincode')
export class Pincode {

   
    @PrimaryGeneratedColumn({name: 'pincode_id'})
    @IsNotEmpty()
    public pincodeId: number;

   
    @Column({ name: 'district_code' })
    public districtCode: string;
	
	@IsNotEmpty()
    @Column({ name: 'district_name' })
    public districtName: string;
	
	@IsNotEmpty()
    @Column({ name: 'pincode' })
    public pincode: string;
	
	@IsNotEmpty()
    @Column({ name: 'state_code' })
    public stateCode: string;
	
	@IsNotEmpty()
    @Column({ name: 'state_name' })
    public stateName: string;
	
	@IsNotEmpty()
    @Column({ name: 'taluka_name' })
    public talikaName: string;
	
}
