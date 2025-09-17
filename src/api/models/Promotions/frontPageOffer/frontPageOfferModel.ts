/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../../BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';
@Entity('tm_front_page_offer')
export class FrontPageOffer extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public Id: number;

    @Column({ name: 'product_ids' })
    public productIds: string;

    @Column({ name: 'show_on' })
    public showOn: string;

    @Column({ name: 'list_type' })
    public listType: string;

    @Column({ name: 'image_path' })
    public imagePath: string;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'link' })
    public link: string;

    @Column({ name: 'content' })
    public content: string;

    @Column({ name: 'status' })
    public status: number;
    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
