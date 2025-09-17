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

@Entity('tt_store_inventory')
export class StoreInventory {

    @PrimaryGeneratedColumn({name: 'Id'})
    @IsNotEmpty()
    public Id: number;
	
	@IsNotEmpty()
    @Column({ name: 'store_id' })
    public storeId: number;
	
	@IsNotEmpty()
    @Column({ name: 'prod_id' })
    public prodId: number;
	
	@IsNotEmpty()
    @Column({ name: 'product_quantity' })
    public productQuantity: number;

}
