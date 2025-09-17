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
import { CommentRepository } from '../repositories/CommentRepository';

@Service()
export class CommentService {

    constructor(
        @OrmRepository() private commentRepository: CommentRepository,
       ) {
    }


     // create comment
     public async create(comment: any): Promise<any> {
        console.log("comment>>data",comment);
        return this.commentRepository.save(comment);
    }
     // get comment by blog Id
     public async getCommentByBlogId(limit: any, offset: any,blogId:any): Promise<any> {
        const condition: any = {};

        condition.order = { createdDate: 'DESC' };
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (blogId) {
            condition.where = {
                blog_id: blogId,
                is_active: 1,
            };
        }
        console.log("catogory>>>",condition);
            return this.commentRepository.find(condition);
        
    }

      // get comment by blog Id
      public async getAllComment(limit: any, offset: any,status:any): Promise<any> {
        const condition: any = {};
       if(status){
        condition.where = {
            is_active: status,
        };
       }
        condition.order = { createdDate: 'DESC' };
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        console.log("catogory>>>",condition);
            return this.commentRepository.find(condition); 
    }

    public findOne(blog: any): Promise<any> {
        return this.commentRepository.findOne(blog);
    }  
}
