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

export class CreateRole {

    @MaxLength(64, {
        message: 'name should be maximum 64 characters',
    })
    @IsNotEmpty({
        message: 'name is required',
    })
    public name: string;

    @IsNotEmpty({
        message: 'status is required',
    })
    public status: number;
}
