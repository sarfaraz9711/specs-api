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

@Entity('tm_city')
export class City {

    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;
	
	@IsNotEmpty()
    @Column({ name: 'state_id' })
    public state_id: number;
	
	@IsNotEmpty()
    @Column({ name: 'city' })
    public city: string;
	
	@IsNotEmpty()
    @Column({ name: 'city_code' })
    public city_code: string;

}
