/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { IsNotEmpty, Max, MaxLength } from 'class-validator';
export class AddCategory {

    @MaxLength(255, {
        message: 'Category name should be maximum 255 character',
    })
    @IsNotEmpty()
    public name: string;

    public image: string;

    public parentInt: number;

    @Max(9999, {
        message: 'Maximum length of sortOrder should be 4',
    })
    @IsNotEmpty()
    public sortOrder: number;
    @MaxLength(60, {
        message: 'metatagTitle should be maximum 60 character',
    })
    public metaTagTitle: string;
    @MaxLength(160, {
        message: 'metatagDescription should be maximum 160 character',
    })
    public metaTagDescription: string;
    @MaxLength(255, {
        message: 'metaTagKeyword should be maximum 255 character',
    })
    public metaTagKeyword: string;
    @IsNotEmpty()
    public status: number;

    public categorySlug: string;
}
