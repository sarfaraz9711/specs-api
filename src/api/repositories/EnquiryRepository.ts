/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { EntityRepository, Repository } from 'typeorm';
import { Enquiry } from '../models/Enquiry';

@EntityRepository(Enquiry)
export class EnquiryRepository extends Repository<Enquiry>  {

}
