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
@Entity('tm_sub_district')
export class SubDistrict {

   
    @PrimaryGeneratedColumn({name: 'sub_district_id'})
    @IsNotEmpty()
    public subDistrictId: number;

    @Column({ name: 'district_code_fk' })
    public district_code_fk: string;
	
    @Column({ name: 'district_id_fk' })
    public districtIdFk: string;
	
    @Column({ name: 'sub_district_name' })
    public subDistrictName: string;
	
    @Column({ name: 'status' })
    public status: string;

    @Column({ name: 'water_level' })
    public waterLevel: string;
	
}
