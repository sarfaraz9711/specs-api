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
import { Career } from '../models/Career';
import { CareerRepository } from '../repositories/CareerRepository';
import {Like} from 'typeorm';

@Service()
export class CareerService {

    constructor(
        @OrmRepository() private CareerCreateRepository: CareerRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
    // create Career
    public async create(career: Career): Promise<Career> {
       // this.log.info('Create a new user => ', user.toString());
        const newCareer = await this.CareerCreateRepository.save(career);
        return newCareer;
    }
	
	 // career list
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
            return this.CareerCreateRepository.find(condition);
    }

   
}
