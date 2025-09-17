/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {IsNotEmpty, IsEmail} from 'class-validator';

export class CreateCareer {
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
        message: 'Address is required',
    })
    public Address: string;
	
	@IsNotEmpty({
        message: 'Functional area  is required',
    })
    public Functional_area: string;
	
	@IsNotEmpty({
        message: 'External link   is required',
    })
    public External_link_1: string;
	
	@IsNotEmpty({
        message: 'External link  is required',
    })
    public External_link_2: string;
	
}
