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
export class UpdateCategoryRequest {

    @IsNotEmpty()
    public categoryId: number;

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
        message: 'metaTagTitle should be maximum 60 characters',
    })
    public metaTagTitle: string;
    @MaxLength(160, {
        message: 'metaTagDescription should be maximum 160 characters',
    })
    public metaTagDescription: string;
    @MaxLength(255, {
        message: 'metaTagKeyword should be maximum 255 characters',
    })
    public metaTagKeyword: string;
    public status: number;
    public categorySlug: string;
}
