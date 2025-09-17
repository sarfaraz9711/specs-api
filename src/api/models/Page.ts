/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import { PageGroup } from './PageGroup';
import moment = require('moment/moment');
import { IsNotEmpty,IsEmpty } from 'class-validator';

@Entity('page')
export class Page extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'page_id' })
    public pageId: number;
    @IsNotEmpty()
    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'intro' })
    public intro: string;
    @IsNotEmpty()
    @Column({ name: 'full_text' })
    public content: string;

    @Column({ name: 'page_group_id' })
    public pageGroupId: number;

    @Column({ name: 'sort_order' })
    public sortOrder: number;

    @Column({ name: 'meta_tag_title' })
    public metaTagTitle: string;
    @IsNotEmpty()
    @Column({ name: 'slug_name' })
    public slugName: string;

    @Column({ name: 'meta_tag_description' })
    public metaTagContent: string;

    @Column({ name: 'meta_tag_keywords' })
    public metaTagKeyword: string;

    @Column({ name: 'view_page_count' })
    public viewPageCount: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @IsEmpty()
    @Column({ name: 'old_content_id' })
    public oldContentId: number;

    @IsEmpty()
    @Column({ name: 'file_url' })
    public fileUrl: string;

    @IsEmpty()
    @Column({ name: 'old_content_creation_date'})
    public oldContentCreationDate: string;

    @ManyToOne(type => PageGroup, pageGroup => pageGroup.page)
    @JoinColumn({ name: 'page_group_id' })
    public pageGroup: PageGroup;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
