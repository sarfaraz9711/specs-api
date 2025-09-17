/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment/moment';
//import { Blog } from './Blog';
import { IsNotEmpty } from 'class-validator';

@Entity('blog_comment')
export class BlogComment extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'comment' })
    public comment: string;
    @IsNotEmpty()
    @Column({ name: 'blog_id' })
    public blog_id: number;
    @IsNotEmpty()
    @Column({ name: 'is_active' })
    public is_active: string;
    
    // @ManyToOne(() => Blog, Blog => Blog.id)
    // public Blog: Blog[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
