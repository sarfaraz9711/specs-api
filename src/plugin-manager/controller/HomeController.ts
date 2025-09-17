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

// import { lstatSync, readdirSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';

export class HomeController {
    constructor() {
        // ---
    }

    public async home(req: express.Request, res: express.Response): Promise<any> {
        const directoryPath = path.join(process.cwd(), 'plugins' + '/');
        const directoryList = await fs.readdirSync (directoryPath);
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginList = await pluginRepository.find();
        for (const directory of directoryList) {
            const index = pluginList.findIndex(p => p.pluginName.toLowerCase() === directory.toLowerCase());
            if (index === -1) {
                const plugin = new Plugins();
                plugin.pluginName = directory;
                plugin.pluginStatus = 0;
                pluginList.push(plugin);
            }
        }
        res.render('pages/home', {
            data: pluginList,
            path: '../home',
            baseUrl: env.app.schema + '://' + env.app.host + ( env.app.port ? ':' + env.app.port : '') + env.app.routePrefix,
            title: 'Home Page',
        });
    }

}
