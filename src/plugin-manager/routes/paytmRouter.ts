import * as express from 'express';
import {PaytmController} from '../controller/PaytmController';

const paytmController = new PaytmController();

export const PaytmRoute: express.Router = express.Router()

.get('/', paytmController.index)

.post('/', paytmController.updateSettings);

export const PaytmNoAuthRoute: express.Router = express.Router()

 .post('/successFailureResult', paytmController.successFailure);

// .get('/success', stripeController.success)

// .get('/cancel', stripeController.cancel);


