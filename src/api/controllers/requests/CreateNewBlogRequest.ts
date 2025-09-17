/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
//import { IsNotEmpty  } from 'class-validator';
export class CreateNewBlogRequest {
    //@IsNotEmpty()
    public id: number;
    public title: string;
    public description: string;
    public image: string;
    public category_name: string;
    public status: number;
    public banner_image:string;
}
