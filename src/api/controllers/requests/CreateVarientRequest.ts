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

export interface VarientsValue {
    valueName?: string;
    sortOrder?: number;
}

export class CreateVarients {
    @MaxLength(255, {
        message: 'name should be maximum 255 character',
    })
    @IsNotEmpty()
    public name: string;

    public type: string;

    public category:string;
    public varientDisplayName:string;

    @Max(9999, {
        message: 'Maximum length of sortOrder should be 4',
    })
    @IsNotEmpty()
    public sortOrder: number;

    public varientsValue: VarientsValue[];
}
