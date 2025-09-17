/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { IsNotEmpty, MinLength } from 'class-validator';

export class VerifyOtp {
    @MinLength(10, {
        message: 'Mobile no should be minimum 10 digit',
    })
    @IsNotEmpty({
        message: 'Mobile no is required',
    })
    public mobile_no: string;

    @IsNotEmpty({
        message: 'otp is required',
    })
    public otp: string;
}
