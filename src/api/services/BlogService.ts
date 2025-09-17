/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Like } from 'typeorm/index';
import { BlogRepository } from '../repositories/BlogRepository';

@Service()
export class BlogService {

    constructor(
        @OrmRepository() private blogRepository: BlogRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create blog
    public async create(blog: any): Promise<any> {
        this.log.info('Create a new blog ',blog);
        return this.blogRepository.save(blog);
    }

    // find One blog
    public findOne(blog: any): Promise<any> {
        return this.blogRepository.findOne(blog);
    }

    // findAll blog
    public findAll(blog: any): Promise<any> {
        return this.blogRepository.find(blog);
    }

    // update blog
    public update(blog: any): Promise<any> {
        return this.blogRepository.save(blog);
    }

    // blog List
    public async list(limit: any, offset: any, select: any = [], search: any = [], whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};

        if (select && select.length > 0) {
            condition.select = select;
        }
        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }
        if (search && search.length > 0) {
            search.forEach((table: any) => {
                const operator: string = table.op;
                if (operator === 'where' && table.value !== undefined) {
                    condition.where[table.name] = table.value;
                } else if (operator === 'like' && table.value !== undefined) {
                    condition.where[table.name] = Like('%' + table.value + '%');
                }
            });
        }

        condition.order = { createdDate: 'DESC' };
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (count) {
            return this.blogRepository.count(condition);
        } else {
            return this.blogRepository.find(condition);
        }
    }

    // delete blog
    public async delete(id: number): Promise<any> {
        return await this.blogRepository.delete(id);
    }
    public async slugData(data: string): Promise<any> {
        return await this.blogRepository.blogSlug(data);
    }

    public async checkSlug(slug: string, id: number, count: number = 0): Promise<number> {
        if (count > 0) {
            slug = slug + count;
        }
        return await this.blogRepository.checkSlugData(slug, id);
    }

    public async blogList(limit: any, offset: any,category:any,status:any): Promise<any> {
        const condition: any = {};
      
        if(category){
            condition.where = {
                category_name: category,
                isActive:1
            };
           }
           if(status==0 || status==1){
            condition.where = {
                isActive:status
            };
           }
           console.log("condition>>>>",condition);
        condition.order = { createdDate: 'DESC' };
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
            return this.blogRepository.find(condition);
        
    }

    public async getblogByCategory(limit: any, offset: any,category:any): Promise<any> {
        const condition: any = {};

        condition.order = { createdDate: 'DESC' };
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (category) {
            condition.where = {
                category_name: category,
            };
        }
        console.log("catogory>>>",condition);
            return this.blogRepository.find(condition);
        
    }

    public async getblogById(limit: any, offset: any,id:any): Promise<any> {
        const condition: any = {};

        condition.order = { createdDate: 'DESC' };
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (id) {
            condition.where = {
                id: id,
            };
        }
        console.log("catogory>>>",condition);
            return this.blogRepository.findOne(condition);
        
    }

//---------------------------
    public async blogCount(condition:any): Promise<any> {
        return this.blogRepository.count(condition);

    }

    
}
