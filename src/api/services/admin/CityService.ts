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
import { City } from '../../models/City';
import { CityRepository } from '../../repositories/CityRepository';
//import {Like} from 'typeorm';

@Service()
export class CityService {

    constructor(
        @OrmRepository() private CityCreateRepository: CityRepository,
        // @Logger(__filename) private log: LoggerInterface
    ) { }


    // create State
    public async create(city: City): Promise<City> {
        // this.log.info('Create a new user => ', user.toString());
        const newCity = await this.CityCreateRepository.save(city);
        return newCity;
    }

    // find Condition
    public findOne(city: any): Promise<any> {
        return this.CityCreateRepository.find(city);
    }
}
