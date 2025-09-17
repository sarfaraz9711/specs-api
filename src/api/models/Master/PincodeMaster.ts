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

//import { UserGroup } from './UserGroup';
// import {BaseModel} from './BaseModel';
// import moment from 'moment';
//import {AccessToken} from './AccessTokenModel';

@Entity('tm_pincode_master')
export class PincodeMaster {

    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;

    @Column({ name: 'circlename' })
    public circlename: string;
	
    @Column({ name: 'divisionname' })
    public divisionname: string;
	
    @Column({ name: 'officename' })
    public officename: string;
	
    @Column({ name: 'pincode' })
    public pincode: string;
	
    @Column({ name: 'officetype' })
    public officetype: string;
	
    @Column({ name: 'delivery' })
    public delivery: string;

    @Column({ name: 'district' })
    public district: string;

    @Column({ name: 'statename' })
    public statename: string;

    @Column({ name: 'latitude' })
    public latitude: string;

    @Column({ name: 'longitude' })
    public longitude: string;

    @Column({ name: 'regionname' })
    public regionname: string;

}
