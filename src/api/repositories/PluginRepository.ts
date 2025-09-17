/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';
import { Plugins } from '../../plugin-manager/models/Plugin';

@EntityRepository(Plugins)
export class PluginRepository extends Repository<Plugins>  {

}
