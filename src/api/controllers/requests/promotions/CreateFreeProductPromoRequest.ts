/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty, ArrayNotEmpty } from 'class-validator';

export class CreateFreeProductPromoRequest {
    @IsNotEmpty({
        message: "promoName can not be empty"
    })
    public promoName: string;
    
    @ArrayNotEmpty({
        message: "selectedBuyProduct can not be empty"
    })
    public selectedBuyProducts: (number)[];

    public selectedOfferProducts: (number)[];
    
    @IsNotEmpty({
        message: 'Start date can not be empty'
    })
    public startDate: string;

    @IsNotEmpty({
        message: 'End date can not be empty'
    })
    public endDate: string;

    public status: string;    

    public percentageDiscount: number;  
    public discouctAmount: number;  
    
}
