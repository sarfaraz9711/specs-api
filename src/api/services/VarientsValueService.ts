/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { VarientsValue } from '../models/VarientsValue';
import { VarientsValueRepository } from '../repositories/VarientsValueRepository';

@Service()
export class VarientsValueService {
    constructor(
        @OrmRepository() private varientsValueRepository: VarientsValueRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(Data: any): Promise<VarientsValue> {
        this.log.info('create a data');
        return this.varientsValueRepository.save(Data);
    }
    // findone a data
    public findOne(id: any): Promise<VarientsValue> {
        this.log.info('Find a data');
        return this.varientsValueRepository.findOne(id);
    }

    // findone a data
    public findOneData(data: any): Promise<VarientsValue> {
        this.log.info('Find a data');
        return this.varientsValueRepository.findOne(data);
    }
    // find condition
    public find(option: any): Promise<VarientsValue[]> {
        return this.varientsValueRepository.find(option);
    }

    // delete VarientsValue
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a VarientsValue');
        await this.varientsValueRepository.delete(id);
        return;
    }
}
