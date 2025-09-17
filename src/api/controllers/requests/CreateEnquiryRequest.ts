/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {IsNotEmpty, IsEmail} from 'class-validator';

export class CreateEnquiry {
     @IsEmail({}, {
        message: 'Please provide emailid as emailId',
    })
    @IsNotEmpty({
        message: 'emailid is required',
    })
    public Email: string;

    @IsNotEmpty({
        message: 'name is required',
    })
    public Name: string;
	
	@IsNotEmpty({
        message: 'Mobile is required',
    })
    public Mobile_no: string;
	
	@IsNotEmpty({
        message: 'Company name is required',
    })
    public Company_name: string;
	
	@IsNotEmpty({
        message: 'City  is required',
    })
    public City: string;
	
	@IsNotEmpty({
        message: 'Product quantity  is required',
    })
    public Product_quantity: string;
	
	@IsNotEmpty({
        message: 'Requirement  is required',
    })
    public Requirement: string;
	
}
