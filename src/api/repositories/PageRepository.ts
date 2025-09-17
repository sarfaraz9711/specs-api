/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';
import { Page } from '../models/Page';

@EntityRepository(Page)
export class PageRepository extends Repository<Page>  {

    public async pageSlug(data: string): Promise<any> {
        const query: any = await this.manager.createQueryBuilder(Page, 'page');
        query.where('page.metaTagTitle = :value OR page.title = :value', { value: data });
        return query.getMany();
    }

    public async checkSlugData(slug: string, id: number): Promise<number> {
        const query = await this.manager.createQueryBuilder(Page, 'page');
        query.where('page.slug_name = :slug', { slug });
        if (id > 0) {
            query.andWhere('page.page_id != :id', { id });
        }
        return query.getCount();
    }
}
