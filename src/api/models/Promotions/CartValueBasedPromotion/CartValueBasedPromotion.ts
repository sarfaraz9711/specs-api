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

@Entity('tm_cart_value_based_promotion')
export class CartValueBasedPromotion {

   
    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public Id: number;

    @Column({ name: 'product_id' })
    public productId: number;
	
    @Column({ name: 'cart_value' })
    public cartValue: number;
	
    @Column({ name: 'max_cart_value' })
    public maxCartValue: number;
	
    
    @Column({ name: 'discount_type' })
    public discountType: string;
	
    @Column({ name: 'discount_value' })
    public discountValue: number;
	
    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'start_date' })
    public startDate: string;

    @Column({ name: 'end_date' })
    public endDate: string;

    @Column({ name: 'start_time' })
    public startTime: string;

    @Column({ name: 'end_time' })
    public endTime: string;

    @Column({ name: 'starttimestamp' })
    public startTimeStamp: number;

    @Column({ name: 'endtimestamp' })
    public endTimeStamp: number;
}
