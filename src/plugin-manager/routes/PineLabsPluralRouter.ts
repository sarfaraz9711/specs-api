import * as express from 'express';
import {PineLabsPluralController} from '../controller/PineLabsPluralController';

const pineLabsPluralController = new PineLabsPluralController();

export const PineLabsPluralRoute: express.Router = express.Router()

.get('/', pineLabsPluralController.index)

.post('/', pineLabsPluralController.updateSettings)

.get('/pl-success', pineLabsPluralController.success);

export const PineLabsPluralNoAuthRoute: express.Router = express.Router()

 .get('/pl-success', pineLabsPluralController.success);

// .get('/success', stripeController.success)

// .get('/cancel', stripeController.cancel);
