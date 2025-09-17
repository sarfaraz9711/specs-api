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
import { CaptchaRepository } from '../repositories/CaptchaRepository';
import { Captcha } from '../models/Captcha';

@Service()
export class CaptchaService {

    constructor(
        @OrmRepository() private captchaRepository: CaptchaRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create address
    public async create(captcha: Captcha): Promise<any> {
        this.log.info('Create a new address ');
        return this.captchaRepository.save(captcha);
    }
   
}
