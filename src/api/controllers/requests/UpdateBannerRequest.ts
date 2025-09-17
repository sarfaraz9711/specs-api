/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty, MaxLength  } from 'class-validator';

export class UpdateBanner {

    @IsNotEmpty()
    public bannerId: number;
    @MaxLength(255, {
        message: 'title should be maximum 255 character',
    })
    @IsNotEmpty({
        message: 'title is required',
    })
    public title: string;
    public bannerFor: string;
    public content: string;

    public image: string;
    @MaxLength(255, {
        message: 'link should be maximum 255 character',
    })
    public link: string;

    public position: number;
    @IsNotEmpty()
    public status: number;
}
