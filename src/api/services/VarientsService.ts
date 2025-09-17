/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Service } from 'typedi';
import { getManager } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Varients } from '../models/Varients';
import { VarientsRepository } from '../repositories/VarientsRepository';

@Service()
export class VarientsService {
    constructor(
        @OrmRepository() private varientsRepository: VarientsRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(Data: any): Promise<Varients> {
        this.log.info('create a data');
        return this.varientsRepository.save(Data);
    }
    // findone a data
    public findOne(id: any): Promise<Varients> {
        this.log.info('Find a data');
        return this.varientsRepository.findOne(id);
    }

    // findone a data
    public async findByCategoryName(category: any): Promise<any> {
        return await getManager()
        .createQueryBuilder('varients', 'vn')
        .select(['vn.name' as 'name', 'vn.category' as 'category'])
        .addSelect(['vv.value_name' as 'valueName','vv.is_active' as 'is_active'])
        .innerJoin('varients_value', 'vv', 'vn.id = vv.varients_id')
        .where('vn.category = :categoryValue',{categoryValue:category})
        .andWhere('vv.is_active is null')
        .groupBy('vv.id')
        .getRawMany();
    }

    
    // findall  data
    public async findAllData(): Promise<any> {
        return await getManager()
        .createQueryBuilder('varients', 'vn')
        .select(['vn.name' as 'name', 'vn.category' as 'category'])
        .addSelect(['vv.value_name' as 'valueName','vv.is_active' as 'is_active'])
        .innerJoin('varients_value', 'vv', 'vn.id = vv.varients_id')
        .getRawMany();
    }

    // find condition
    public find(option: any): Promise<Varients[]> {
        return this.varientsRepository.find(option);
    }

    // Varients List
    public list(limit: number, offset: number, select: any = [], relation: any = [], whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};
        condition.where = {};
        if (select && select.length > 0) {
            condition.select = select;
        }
        if (relation && relation.length > 0) {
            condition.relations = relation;
        }
        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        condition.order = {
            sortOrder: 'ASC',
        };
        if (count) {
            return this.varientsRepository.count(condition);
        } else {
            return this.varientsRepository.find(condition);
        }
    }

    // delete OptionValue
    public async delete(id: number): Promise<any> {
        this.log.info('Delete a varients');
        await this.varientsRepository.delete(id);
        return;
    }
}
