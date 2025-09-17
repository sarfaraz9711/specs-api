/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {IsNotEmpty, IsEmail, IsIn} from 'class-validator';


export class CreateFeedback {
     @IsEmail({}, {
        message: 'Please provide emailid as emailId',
    })
    @IsNotEmpty({
        message: 'emailid is required',
    })
    public email: string;

    @IsNotEmpty({
        message: 'feedback message is required',
    })
    public feedMsg: string;
	
	@IsIn(['complain', 'feedback'])
	@IsNotEmpty({
        message: 'type is required',
    })
    public type: string;
}
