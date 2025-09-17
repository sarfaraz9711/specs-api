/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {IsNotEmpty} from 'class-validator';

export class CreateCustomerPreference {
	@IsNotEmpty({
        message: 'Customer id is required',
    })
    public customer_id: number;
	
	@IsNotEmpty({
        message: 'Customer Preference  is required',
    })
    public customer_preference: string;

    @IsNotEmpty({
        message: 'Customer Preference  is required',
    })
    public status: number;
    
}
