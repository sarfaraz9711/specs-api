/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateBanner {
    @MaxLength(255, {
        message: 'title should be maximum 255 characters',
    })

    public title: string;

    public content: string;

    public bannerFor: string;

    @IsNotEmpty()
    public image: string;

    public link: string;

    public position: number;
    @IsNotEmpty()
    public status: number;
}
