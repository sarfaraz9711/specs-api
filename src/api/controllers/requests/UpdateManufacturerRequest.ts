/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {IsNotEmpty, Max, MaxLength} from 'class-validator';

export class UpdateManufacturer {

    @IsNotEmpty()
    public manufacturerId: number;

    @MaxLength(64, {
        message: 'Name should be maximum 64 character',
    })
    @IsNotEmpty()
    public name: string;

    public image: string;

    @Max(9999, {
        message: 'Maximum length of sortOrder should be 4',
    })
    @IsNotEmpty({
        message: 'sortOrder is required',
    })
    public sortOrder: number;

    @IsNotEmpty({
        message: 'status is required',
    })
    public status: number;
}
