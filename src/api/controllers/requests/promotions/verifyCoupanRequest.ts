/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class VerifyCoupanRequest {
    @IsNotEmpty({
        message: "Coupon Code can not be empty"
    })
    public couponCode: string;

    public couponValue: number;
    public emailRestrictions: string;
}
