/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {IsNotEmpty, MaxLength} from 'class-validator';

export class UpdatePage {

    @IsNotEmpty()
    public pageId: number;
    @MaxLength(255, {
        message: 'title should be maximum 255 character',
    })
    @IsNotEmpty({
        message: 'title is required',
    })
    public title: string;

    @IsNotEmpty({
        message: 'content is required',
    })
    public content: string;

    @IsNotEmpty()
    public active: number;

    @MaxLength(60, {
        message: 'metatagTitle should be maximum 60 character',
    })
    public metaTagTitle: string;
    @MaxLength(160, {
        message: 'metatagTitle should be maximum 160 character',
    })
    public metaTagContent: string;
    @MaxLength(255, {
        message: 'metatagTitle should be maximum 255 character',
    })
    public metaTagKeyword: string;
    @IsNotEmpty({
        message: 'pageGroupId is required',
    })
    public pageGroupId: number;

    public pageSlug: string;

    public fileUrl : string
}
