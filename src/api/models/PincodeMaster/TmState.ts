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
@Entity('tm_state_ut')
export class State {

   
    @PrimaryGeneratedColumn({name: 'state_ut_id'})
    @IsNotEmpty()
    public Id: number;

   
    @Column({ name: 'state_ut_name' })
    public state: string;
	
    @Column({ name: 'state_ut_code' })
    public stateCode: string;
	
}
