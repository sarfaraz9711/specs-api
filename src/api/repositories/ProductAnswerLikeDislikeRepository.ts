/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';
import { ProductAnswerLikeDislike } from '../models/ProductAnswerLikeDislike';

@EntityRepository(ProductAnswerLikeDislike)
export class ProductAnswerLikeDislikeRepository extends Repository<ProductAnswerLikeDislike>  {
    public async findLikeCount(answerId: number): Promise<any> {
        const query: any = await this.manager.createQueryBuilder(ProductAnswerLikeDislike, 'productAnswerLikeDislike');
        query.select('COUNT(productAnswerLikeDislike.id) as likeCount');
        query.where('productAnswerLikeDislike.type = :type AND productAnswerLikeDislike.answerId = :answerId', { type: 1, answerId });
        return query.getRawOne();
    }

    public async findDislikeCount(answerId: number): Promise<any> {
        const query: any = await this.manager.createQueryBuilder(ProductAnswerLikeDislike, 'productAnswerLikeDislike');
        query.select('COUNT(productAnswerLikeDislike.id) as dislikeCount');
        query.where('productAnswerLikeDislike.type = :type AND productAnswerLikeDislike.answerId = :answerId', { type: 2, answerId });
        return query.getRawOne();
    }

}
