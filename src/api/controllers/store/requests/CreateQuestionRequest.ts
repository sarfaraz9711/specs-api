/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {IsNotEmpty} from 'class-validator';

export class CreateQuestion {

    @IsNotEmpty({
        message: 'question is required',
    })
    public question: string;

    @IsNotEmpty({
        message: 'ProductId is required',
    })
    public productId: number;

    }
