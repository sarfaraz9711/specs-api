import * as express from 'express';
import {IngenicoController} from '../controller/IngenicoController';

const ingenicoController = new IngenicoController();

export const IngenicoRoute: express.Router = express.Router()

.get('/', ingenicoController.index)

.post('/', ingenicoController.updateSettings);

 export const IngenicoNoAuthRoute: express.Router = express.Router()

// .get('/process/:orderPrefixId', stripeController.process)

// .get('/success', stripeController.success)

// .get('/cancel', stripeController.cancel);

 .post('/successFailure', ingenicoController.successFailure);