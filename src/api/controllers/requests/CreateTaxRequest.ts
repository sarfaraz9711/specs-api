/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaxRequest {

    @MaxLength(255, {
        message: 'taxName should be maximum 255 characters',
    })
    public taxName: string;
    public taxPercentage: number;
    @IsNotEmpty()
    public taxStatus: number;
}
