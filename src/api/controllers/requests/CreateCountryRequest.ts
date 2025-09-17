/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty , MaxLength } from 'class-validator';

export class CreateCountry {

    @MaxLength(30, {
        message: 'name should be maximum 30 characters',
    })
    @IsNotEmpty({
        message: 'name is required',
    })
    public name: string;

    @MaxLength(2, {
        message: 'isoCode2 should be maximum 2 characters',
    })
    @IsNotEmpty({
        message: 'isoCode2 is required',
    })
    public isoCode2: string;

    @MaxLength(3, {
        message: 'isoCode3 should be maximum 3 characters',
    })
    @IsNotEmpty({
        message: 'isoCode3 is required',
    })
    public isoCode3: string;
    @IsNotEmpty()
    public postcodeRequired: number;
    @IsNotEmpty()
    public status: number;

}
