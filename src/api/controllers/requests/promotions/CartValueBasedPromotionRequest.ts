/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty, IsIn } from 'class-validator';

export class CartValueBasedPromotionRequest {
    @IsNotEmpty({
        message: "cartValue can not be empty"
    })
    public cartValue: number;

    @IsNotEmpty({
        message: "cartValue can not be empty"
    })
    public maxCartValue: number;

    @IsIn(['Free Products', 'Percentage', 'Flat'])
    @IsNotEmpty({
        message: "discountType can not be empty"
    })
    public discountType: string;
    
    @IsNotEmpty({
        message: 'Start date can not be empty'
    })
    public startDate: string;

    @IsNotEmpty({
        message: 'End date can not be empty'
    })
    public endDate: string;

    @IsNotEmpty({
        message: 'Start time can not be empty'
    })
    public startTime: string;

    @IsNotEmpty({
        message: 'End time can not be empty'
    })
    public endTime: string;
    @IsNotEmpty({
        message: 'Start time stamp can not be empty'
    })
    public startTimeStamp: number;

    @IsNotEmpty({
        message: 'End time stamp can not be empty'
    })
    public endTimeStamp: number;

    @IsNotEmpty({
        message: 'Status date can not be empty'
    })
    public status: number;
    
    public discountValue: number;

    public productId: number; 
    
}
