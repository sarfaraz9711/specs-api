/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {IsNotEmpty, Max} from 'class-validator';

export interface VarientsValue {
    id?: number;
    valueName?: string;
    sortOrder?: number;
}

export class UpdateVarients {
    @IsNotEmpty()
    public name: string;

    public type: string;

    public category: string;

    @Max(9999, {
        message: 'Maximum length of sortOrder should be 4',
    })
    @IsNotEmpty()
    public sortOrder: number;

    public varientsValue: VarientsValue[];
}
