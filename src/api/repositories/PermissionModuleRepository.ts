/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';
import { PermissionModule } from '../models/PermissionModule';

@EntityRepository(PermissionModule)
export class PermissionModuleRepository extends Repository<PermissionModule>  {

}
