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

export class CreateOrderStatus {
    @MaxLength(32, {
        message: 'Name should be maximum 32 character',
    })
    @IsNotEmpty({
        message: 'name is required',
    })
    public name: string;
    @MaxLength(255, {
        message: 'Name should be maximum 255 character',
    })
    @IsNotEmpty({
        message: 'colorCode is required',
    })
    public colorCode: string;

    public priority: number;

    @IsNotEmpty({
        message: 'status is required',
    })
    public status: number;

}
