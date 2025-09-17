/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Get, JsonController, Res, QueryParam } from 'routing-controllers';
import { ManufacturerService } from '../../services/ManufacturerService';

@JsonController('/manufacturers')
export class ManufacturerController {
    constructor(private manufacturerService: ManufacturerService) {
    }

    // Manufacturer List API
    /**
     * @api {get} /api/manufacturers/manufacturerlist Manufacturer List API
     * @apiGroup Store
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count in number
     * @apiParam (Request body) {String} categorySlug categorySlug
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get manufacturer list",
     *      "data":"{
     *      "manufacturerId" : "",
     *      "name" : "",
     *      "image" : "",
     *      "imagePath" : "",
     *      "sortOrder" : "",
     *      }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/manufacturers/manufacturerlist
     * @apiErrorExample {json} Manufacturer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/manufacturerlist')
    public async manufacturerList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('categorySlug') categorySlug: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = [
            'DISTINCT(Manufacturer.manufacturerId) as manufacturerId',
            'Manufacturer.name as name',
            'Manufacturer.image as image',
            'Manufacturer.imagePath as imagePath',
            'Manufacturer.sortOrder as sortOrder',
            'Manufacturer.isActive as isActive',
        ];
        const relations = [];
        const WhereConditions = [];
        const searchConditions = [];
    if (categorySlug !== '' && categorySlug !== undefined) {
        relations.push({
            tableName: 'Manufacturer.product',
            aliasName: 'product',
        },
        {
            tableName: 'product.productToCategory',
            aliasName: 'productToCategory',
        },
        {
            tableName: 'productToCategory.category',
            aliasName: 'category',
        });
        WhereConditions.push({
            name: 'category.categorySlug',
            op: 'and',
            value: '"' + categorySlug + '"',
        });
        WhereConditions.push({
            name: 'product.isActive',
            op: 'and',
            value: 1,
        },
        {
            name: 'Manufacturer.isActive',
            op: 'and',
            value: 1,
        });
    } else {
    WhereConditions.push({
        name: 'Manufacturer.isActive',
        op: 'where',
        value: 1,
    });
}
    if (keyword !== '' && keyword !== undefined) {
    searchConditions.push({
        name: ['Manufacturer.name'],
        value: keyword,
    });
}
const manufacturerList: any = await this.manufacturerService.listByQueryBuilder(limit, offset, select, WhereConditions, searchConditions, relations, [], [], count, true);
const successResponse: any = {
    status: 1,
    message: 'Successfully got all the manufacturer List',
    data: manufacturerList,
};
return response.status(200).send(successResponse);
    }
}
