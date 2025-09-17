/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import * as express from 'express';
import { env } from '../../env';
export class CashondeliveryController {
    constructor(
    ) {
        // ---
    }

    public async cashondelivery(req: express.Request, res: express.Response): Promise<any> {

        res.render('pages/ingenico/success', {
            title: 'Ingenico',
            storeUrl: env.storeUrl,
            layout: 'pages/layouts/auth',
        });
    }
}
