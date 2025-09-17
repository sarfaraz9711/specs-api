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

export class CreateAnswer {

    @IsNotEmpty({
        message: 'Answer is required',
    })
    public answer: string;

    @IsNotEmpty({
        message: 'QuestionId is required',
    })
    public questionId: number;

   }
