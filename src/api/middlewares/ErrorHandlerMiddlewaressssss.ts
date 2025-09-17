/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { ValidationError } from 'class-validator';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { env } from '../../env';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {

    public isProduction = env.isProduction;

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) { }

    /**
     * Error handler - sets response code and sends json with error message.
     * Handle: standard node error, HttpError, ValidationError and string.
     *
     * @param {any} error An throwed object (error)
     * @param {express.Request} req The Express request object
     * @param {express.Response} res The Express response object
     * @param {express.NextFunction} next The next Express middleware function
     */
    public error(error: any, _req: express.Request, res: express.Response, _next: express.NextFunction): void {
        const responseObject = {} as any;

        let c = error;
        let _errorCode = 500;
        let _messageCode = {
            "status" : 500,
            "Message" : error.message
        };
        if (c.name == 'AxiosError') {
            if(c.config.url == 'https://api-staging.pluralonline.com/api/v1/order/create'){
                 _errorCode = c.response.status;
                 _messageCode = {
                    "status" : _errorCode,
                    "Message" : c.response.data.error_message+ " >>Error-code : "+c.response.data.error_code,
                };
            } 
               
        } 

            // if its an array of ValidationError
            if (error && Array.isArray(error.errors) && error.errors.every((element) => element instanceof ValidationError)) {
                res.status(422);
                responseObject.message = "You have an error in your request's body. Check 'errors' field for more details!";
                // responseObject.errors = error;
                responseObject.status = 0;
                responseObject.data = {};
                responseObject.data.message = [];
                error.errors.forEach((element: ValidationError) => {
                    Object.keys(element.constraints).forEach((type) => {
                        responseObject.data.message.push(`property ${element.constraints[type]}`);
                    });
                });
            } else {
                // set http status
                if (error instanceof HttpError && error.httpCode) {
                    res.status(error.httpCode);
                } else {
                    
                    if (c.name == 'AxiosError' && c.config && c.config.url == 'https://leayanglobal.unicommerce.com/services/rest/v1/oms/saleOrder/cancel') {
                        // _errorCode = c.response.status;
                        // _messageCode = {
                        //     "status": _errorCode,
                        //     "Message": c.response.data.error_message + " >>Error-code : " + c.response.data.error_code,
                        // };
                        res.status(200);
                    } else {
                        res.status(_errorCode);
                    }
                }

                if (error instanceof Error) {
                    const developmentMode: boolean = !this.isProduction;

                    // set response error fields
                    if (error.name && (developmentMode || error.message)) { // show name only if in development mode and if error message exist too
                        responseObject.name = (error.name=='AxiosError' ? '' : error.name);
                    }
                    switch (error.name) {
                        case 'AuthorizationRequiredError':
                            responseObject.message = 'Unauthorized';
                            break;
                        default:
                            responseObject.message = _messageCode.Message;
                            break;
                    }

                    if (error.stack && developmentMode) {
                         responseObject.stack = error.stack;
                        //responseObject.stack = null;
                    }
                } else if (typeof error === 'string') {
                    responseObject.message = error;
                }
            }

            if (this.isProduction) {
                this.log.error(error.name, error.message);
            } else {
                 this.log.error(error.name, error.stack);
                //this.log.error(error.name);
            }

            // send json only with error
            res.json(responseObject);
    }

}
