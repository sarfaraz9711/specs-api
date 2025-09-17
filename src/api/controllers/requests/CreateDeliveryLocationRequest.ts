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

export class CreateDeliveryLocationRequest {

    @IsNotEmpty()
    public zipCode: number;
    @MaxLength(255, {
        message: 'locationName should be maximum 255 character',
    })
    public locationName: string;

}
