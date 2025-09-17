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

export class CreateFreeProductPromoRequest {
    @IsNotEmpty({
        message: "couponName can not be empty"
    })
    public couponName: string;
    
    @IsNotEmpty({
        message: "couponName can not be empty"
    })
    public couponCode: string;
    
    @IsNotEmpty({
        message: "couponType can not be empty"
    })
    public couponType: number;

    @IsNotEmpty({
        message: "couponValue can not be empty"
    })
    public couponValue: number;

    
    @IsNotEmpty({
        message: "minimumPurchaseAmount can not be empty"
    })
    public minimumPurchaseAmount: number;

    @IsNotEmpty({
        message: "maximumPurchaseAmount can not be empty"
    })
    public maximumPurchaseAmount: number;
    
    @IsNotEmpty({
        message: "maxCouponUse can not be empty"
    })
    public maxCouponUse: number;
    

    @IsNotEmpty({
        message: "noOfMaxCouponUsePerUser can not be empty"
    })
    public noOfMaxCouponUsePerUser: number;
    
    @IsNotEmpty({
        message: 'Start date can not be empty'
    })
    public startDate: string;

    @IsNotEmpty({
        message: 'End date can not be empty'
    })
    public endDate: string;

    public status: number;    
    
    public emailRestrictions: string;

    public orderId:string
}
