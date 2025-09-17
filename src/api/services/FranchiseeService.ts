/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Franchisee } from '../models/Franchisee';
import { FranchiseeRepository } from '../repositories/FranchiseeRepository';
import {Like} from 'typeorm';
// import {Like} from 'typeorm';

@Service()
export class FranchiseeService {

    constructor(
        @OrmRepository() private FranchiseeCreateRepository: FranchiseeRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
    // create franchisee
    public async create(franchisee: Franchisee): Promise<Franchisee> {
       // this.log.info('Create a new user => ', user.toString());
        const newFranchisee = await this.FranchiseeCreateRepository.save(franchisee);
        return newFranchisee;
    }
	
	 // franchisee list
    public list(limit: number, offset: number,keyword: string, count: number): Promise<any> {
		const condition: any = {};
		condition.where = {};

        if (keyword) {
            condition.where = {
                Name: Like('%' + keyword + '%'),
            };
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
            return this.FranchiseeCreateRepository.find(condition);
    }

   
}
