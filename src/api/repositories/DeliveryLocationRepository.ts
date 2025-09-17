/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';
import { DeliveryLocation } from '../models/DeliveryLocation';

@EntityRepository(DeliveryLocation)
export class DeliveryLocationRepository extends Repository<DeliveryLocation>  {

}
