/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { MinLength, MaxLength} from 'class-validator';
export class ForgotPassword {
    @MaxLength(96, {
        message: 'email is maximum 96 character',
    })
    @MinLength(4, {
        message: 'email is minimum 4 character',
    })
    public email: string;
}
