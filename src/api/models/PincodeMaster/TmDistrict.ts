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
@Entity('tm_district')
export class District {

   
    @PrimaryGeneratedColumn({name: 'district_id'})
    @IsNotEmpty()
    public districtId: number;

   
    @Column({ name: 'district_code' })
    public districtCode: string;
	
    @Column({ name: 'district_name' })
    public districtName: string;
	
    @Column({ name: 'state_code_fk' })
    public state_code_fk: string;
	
    @Column({ name: 'state_id_fk' })
    public stateIdFk: string;
	
    @Column({ name: 'status' })
    public status: string;
	
}
