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
import { State } from '../../models/State';
import { StateRepository } from '../../repositories/StateRepository';
//import {Like} from 'typeorm';

@Service()
export class StateService {

    constructor(
        @OrmRepository() private StateCreateRepository: StateRepository,
        // @Logger(__filename) private log: LoggerInterface
    ) { }


    // create State
    public async create(state: State): Promise<State> {
        // this.log.info('Create a new user => ', user.toString());
        const newState = await this.StateCreateRepository.save(state);
        return newState;
    }

    // state list
    public list(): Promise<any> {
        return this.StateCreateRepository.find();
    }
}
