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
import {getManager} from 'typeorm';
import {Plugins} from '../models/Plugin';
import { env } from '../../env';
// import {Order} from '../../api/models/Order';
// import {OrderProduct} from '../../api/models/OrderProduct';
// import {Product} from '../../api/models/ProductModel';
// import {StripeOrder} from '../models/StripeOrder';
// import {StripeOrderTransaction} from '../models/StripeOrderTransaction';
// import {EmailTemplate} from '../../api/models/EmailTemplate';
// import {ProductImage} from '../../api/models/ProductImage';
// import {Settings} from '../../api/models/Setting';
// import {Currency} from '../../api/models/Currency';
// import {User} from '../../api/models/User';
// import {MAILService} from '../../auth/mail.services';
// import {env} from '../../env';
// import {Payment as Payments} from '../../api/models/Payment';
// import {PaymentItems} from '../../api/models/PaymentItems';
// import moment = require('moment');
export class PineLabsPluralController {

    constructor() {
        // ---
    }

    public async index(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'PineLabsPluralSingleCart',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        res.render('pages/PineLabsPluralSingleCart/form', {
            title: 'Pine Labs Plural',
            path: '../PineLabsPluralSingleCart/form',
            mId: paypalAdditionalInfo.mId ? paypalAdditionalInfo.mId : '',
            merchantPassword: paypalAdditionalInfo.merchantPassword ? paypalAdditionalInfo.merchantPassword : '',
            clientSecret: paypalAdditionalInfo.clientSecret ? paypalAdditionalInfo.clientSecret : '',
            isTest: paypalAdditionalInfo.isTest,
        });
    }

    public async updateSettings(req: express.Request | any, res: express.Response): Promise<any> {
        
        req.assert('mId', 'MId cannot be blank').notEmpty();
        req.assert('merchantPassword', 'Merchant Password cannot be blank').notEmpty();
        req.assert('clientSecret', 'Client Secret cannot be blank').notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            req.flash('errors', errors);
            return res.redirect('paypal');
        }

        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'PineLabsPluralSingleCart',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        paypalAdditionalInfo.mId = req.body.mId;
        paypalAdditionalInfo.merchantPassword = req.body.merchantPassword;
        paypalAdditionalInfo.clientSecret = req.body.clientSecret;
        paypalAdditionalInfo.isTest = req.body.isTest;
        pluginDetail.pluginAdditionalInfo = JSON.stringify(paypalAdditionalInfo);
        const saveResponse = await pluginRepository.save(pluginDetail);
        if (saveResponse) {
            req.flash('success', ['Pine Labs settings updated successfully']);
            return res.redirect('home');
        }
        req.flash('errors', ['Unable to update the pine labs settings']);
        return res.redirect('home');
    }


    public async success(req: express.Request | any, res: express.Response): Promise<any>{

        res.render('pages/ingenico/success', {
            title: 'Pine Labs',
            storeUrl: env.storeUrl,
            layout: 'pages/layouts/auth',
        });
    }

}
