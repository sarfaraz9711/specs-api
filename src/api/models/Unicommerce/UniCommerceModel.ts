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
     Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate
} from 'typeorm';

//import { UserGroup } from './UserGroup';
 import {BaseModel} from '../BaseModel';
 import moment from 'moment';
//import {AccessToken} from './AccessTokenModel';

@Entity('unicommerce_response')
export class UnicommerceResponseModel extends BaseModel {

   
    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;

    @IsNotEmpty()
    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'order_product_id' })
    public orderProductId: number;
	
    @IsNotEmpty()
    @Column({ name: 'order_prefix_id' })
    public orderPrefixId: string;

    @IsNotEmpty()
    @Column({ name: 'request_type' })
    public requestType: string;
    
    @IsNotEmpty()
    @Column({ name: 'uni_request' })
    public uniRequest: string;
    
	@IsNotEmpty()
    @Column({ name: 'uni_response' })
    public uniResponse: string;

    @Column({ name: 'uni_response_status' })
    public uniResponseStatus: boolean;
	
	@BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }


}
