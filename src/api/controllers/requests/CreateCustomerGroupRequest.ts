/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {IsNotEmpty, MaxLength} from 'class-validator';

export class CreateCustomerGroup {

    @MaxLength(30, {
        message: 'name should be maximum 30 characters',
    })
    @IsNotEmpty({
        message: 'name is required',
    })
    public name: string;

    public description: string;

    @IsNotEmpty({
        message: 'colorcode is required',
    })
    public colorcode: string;

    @IsNotEmpty({
        message: 'status is required',
    })
    public status: number;
}
