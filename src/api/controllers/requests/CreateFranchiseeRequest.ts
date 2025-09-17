/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {IsNotEmpty, IsEmail} from 'class-validator';

export class CreateFranchisee {
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
        message: 'Occupation is required',
    })
    public Occupation: string;
	
	@IsNotEmpty({
        message: 'Showroom location  is required',
    })
    public Showroom_location: string;
	
	@IsNotEmpty({
        message: 'Showroom frontage  is required',
    })
    public Showroom_frontage: string;
	
	@IsNotEmpty({
        message: 'Showroom area  is required',
    })
    public Showroom_area: string;
	
	@IsNotEmpty({
        message: 'State  is required',
    })
    public State: string;
	
	@IsNotEmpty({
        message: 'City  is required',
    })
    public City: string;
	
	@IsNotEmpty({
        message: 'Comment  is required',
    })
    public Comment: string;
}
