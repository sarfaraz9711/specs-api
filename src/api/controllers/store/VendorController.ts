/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {
    JsonController,
    Res,
    Get,
    QueryParam,
} from 'routing-controllers';
import { ProductService } from '../../services/ProductService';
import { DeliveryLocationService } from '../../services/DeliveryLocationService';

@JsonController('/vendor-store')
export class VendorStoreController {
    constructor(private productService: ProductService,
                private deliveryLocationService: DeliveryLocationService
    ) {
    }

    // check pincode availability API
    /**
     * @api {get} /api/vendor-store/check-pincode-availability check pincode availability API
     * @apiGroup vendor store
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {Number} pincode pincode
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully checked availability",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/vendor-store/check-pincode-availability
     * @apiErrorExample {json} check pincode availability error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/check-pincode-availability')
    public async checkAvailability(@QueryParam('productId') productId: number, @QueryParam('pincode') pincode: number, @Res() response: any): Promise<any> {
        const productData = await this.productService.findOne({ where: { productId } });
        if (!productData) {
            return response.status(400).send({
                status: 0,
                message: 'Invalid ProductId',
            });
        }
        let deliveryLocation;
        deliveryLocation = await this.deliveryLocationService.findOne({ where: { zipCode: pincode, vendorId: 0 } });
        if (deliveryLocation) {
            const successResponse: any = {
                status: 1,
                message: 'Available',
            };
            return response.status(200).send(successResponse);
        } else {
            const successResponse: any = {
                status: 0,
                message: 'Not Available',
            };
            return response.status(400).send(successResponse);
        }
    }
}
