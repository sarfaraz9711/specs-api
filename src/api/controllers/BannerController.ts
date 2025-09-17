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
    Get,
    Put,
    Delete,
    Param,
    QueryParam,
    Post,
    Body,
    JsonController,
    Authorized,
    Res,
    Req
} from 'routing-controllers';
import { BannerService } from '../services/BannerService';
import { env } from '../../env';
import { Banner } from '../models/Banner';
import { CreateBanner } from './requests/CreateBannerRequest';
import { UpdateBanner } from './requests/UpdateBannerRequest';
import { S3Service } from '../services/S3Service';
import { ImageService } from '../services/ImageService';
import { DeleteBannerRequest } from './requests/DeleteBannerRequest';
import * as fs from 'fs';
import { VisitorModel } from '../models/VisitorModel';
import { getManager } from 'typeorm';
import { CommonService } from '../common/commonService';
import { Settings } from '../models/Setting';

@JsonController('/banner')
export class BannerController {

    constructor(
        private bannerService: BannerService, 
        private s3Service: S3Service,
        private imageService: ImageService,
        private _m: CommonService
    ) {

    }

    // Create Banner
    /**
     * @api {post} /api/banner/add-banner Add Banner API
     * @apiGroup Banner
     * @apiParam (Request body) {String} title title
     * @apiParam (Request body) {String} content content
     * @apiParam (Request body) {String} image image
     * @apiParam (Request body) {String} link link
     * @apiParam (Request body) {String} position position
     * @apiParam (Request body) {Number} status status
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "title" : "",
     *      "content" : "",
     *      "image" : "",
     *      "link" : "",
     *      "position" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New banner is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/banner/add-banner
     * @apiErrorExample {json} Banner error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-banner')
    @Authorized(['admin', 'create-banners'])
    public async createBanner(@Body({ validate: true }) bannerParam: CreateBanner, @Res() response: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({bannerFlag:currentDate}).execute()
        const image = bannerParam.image;
        if (image) {
            const type = image.split(';')[0].split('/')[1];
            const availableTypes = env.availImageTypes.split(',');
            if (!availableTypes.includes(type)) {
                const errorTypeResponse: any = {
                    status: 0,
                    message: 'Only ' + env.availImageTypes + ' types are allowed',
                };
                return response.status(400).send(errorTypeResponse);
            }
            const name = 'Img_' + Date.now() + '.' + type;
            const path = 'banner/';
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const stringLength = image.replace(/^data:image\/\w+;base64,/, '').length;
            const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
            const sizeInKb = sizeInBytes / 1024;
            if (+sizeInKb <= 5120) {
                if (env.imageserver === 's3') {
                    await this.s3Service.imageUpload((path + name), base64Data, type);
                } else {
                    await this.imageService.imageUpload((path + name), base64Data);
                }
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Not able to update as the file size is too large. ',
                };
                return response.status(400).send(errorResponse);
            }
            const newBanner = new Banner();
            newBanner.title = bannerParam.title;
            newBanner.bannerFor = bannerParam.bannerFor;
            newBanner.content = bannerParam.content;
            newBanner.image = name;
            newBanner.imagePath = path;
            newBanner.link = bannerParam.link;
            newBanner.position = bannerParam.position;
            newBanner.isActive = bannerParam.status;
            const bannerSave = await this.bannerService.create(newBanner);

            if (bannerSave) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created new banner.',
                    data: bannerSave,
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Unable to create new banner. ',
                };
                return response.status(400).send(errorResponse);
            }
        }
    }

    // Banner List
    /**
     * @api {get} /api/banner/bannerlist Banner List API
     * @apiGroup Banner
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got banner list",
     *      "data":"{
     *      "bannerId": "",
     *      "title": "",
     *      "content": "",
     *      "image": "",
     *      "imagePath": "",
     *      "link": "",
     *      "position": "",
     *      }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/banner/bannerlist
     * @apiErrorExample {json} Banner error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/bannerlist')
    @Authorized(['admin', 'list-banners'])
    public async bannerList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('bannerFor') bannerFor: string, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['bannerFor','bannerId', 'title', 'image', 'imagePath', 'content', 'link', 'position', 'isActive'];
        const search = [
            {
                name: 'title',
                op: 'like',
                value: keyword,
            }, {
                name: 'isActive',
                op: 'like',
                value: status,
            },
        ];
        const WhereConditions = [
            {
                name: 'bannerFor',
                op: 'and',
                value: bannerFor,
            }
        ];
        const bannerList: any = await this.bannerService.list(limit, offset, select, search, WhereConditions, count);
        if (count) {
            const successRes: any = {
                status: 1,
                message: 'Successfully got banner count',
                data: bannerList,
            };
            return response.status(200).send(successRes);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully got banner list',
            data: bannerList,
        };
        return response.status(200).send(successResponse);
    }

    // Delete Banner
    /**
     * @api {delete} /api/banner/delete-banner/:id Delete Banner API
     * @apiGroup Banner
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "bannerId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted Banner.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/banner/delete-banner/:id
     * @apiErrorExample {json} Banner error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-banner/:id')
    @Authorized()
    public async deleteBanner(@Param('id') id: number, @Res() response: any, @Req() request: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({bannerFlag:currentDate}).execute()
        const banner = await this.bannerService.findOne({
            where: {
                bannerId: id,
            },
        });
        if (!banner) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Banner Id.',
            };
            return response.status(400).send(errorResponse);
        }

        const deleteBanner = await this.bannerService.delete(banner);
        if (deleteBanner) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted banner.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete banner.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Update Banner
    /**
     * @api {put} /api/banner/update-banner/:id Update Banner API
     * @apiGroup Banner
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} bannerId Banner bannerId
     * @apiParam (Request body) {String} title Banner title
     * @apiParam (Request body) {String} image Banner image
     * @apiParam (Request body) {String} content Banner content
     * @apiParam (Request body) {String} link Banner link
     * @apiParam (Request body) {Number} position Banner position
     * @apiParam (Request body) {Number} status status
     * @apiParamExample {json} Input
     * {
     *      "bannerId" : "",
     *      "title" : "",
     *      "image" : "",
     *      "content" : "",
     *      "link" : "",
     *      "position" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated banner.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/banner/update-banner/:id
     * @apiErrorExample {json} Banner error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-banner/:id')
    @Authorized(['admin', 'edit-banners'])
    public async updateBanner(@Body({ validate: false }) bannerParam: UpdateBanner, @Res() response: any, @Req() request: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({bannerFlag:currentDate}).execute()
        //var linkdecode = atob(bannerParam.link);
        

        const banner = await this.bannerService.findOne({
            where: {
                bannerId: bannerParam.bannerId,
            },
        });
        if (!banner) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Banner Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const image = bannerParam.image;
        if (image) {
            const type = image.split(';')[0].split('/')[1];
            const availableTypes = env.availImageTypes.split(',');
            if (!availableTypes.includes(type)) {
                const errorTypeResponse: any = {
                    status: 0,
                    message: 'Only ' + env.availImageTypes + ' types are allowed',
                };
                return response.status(400).send(errorTypeResponse);
            }
            const name = 'Img_' + Date.now() + '.' + type;
            const path = 'banner/';
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const stringLength = image.replace(/^data:image\/\w+;base64,/, '').length;
            const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
            const sizeInKb = sizeInBytes / 1024;
            if (+sizeInKb <= 5120) {
                if (env.imageserver === 's3') {
                    await this.s3Service.imageUpload((path + name), base64Data, type);
                } else {
                    await this.imageService.imageUpload((path + name), base64Data);
                }
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Not able to update as the file size is too large',
                };
                return response.status(400).send(errorResponse);
            }
            banner.image = name;
            banner.imagePath = path;
        }
        banner.title = bannerParam.title;
        banner.bannerFor = bannerParam.bannerFor;
        banner.content = bannerParam.content;
        banner.link = bannerParam.link;
        banner.position = bannerParam.position;
        banner.isActive = bannerParam.status;
        const bannerSave = await this.bannerService.create(banner);

        if (bannerSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated banner.',
                data: bannerSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the banner. ',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete Multiple Banner API

    /**
     * @api {post} /api/banner/delete-banner Delete Multiple Banner API
     * @apiGroup Banner
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} bannerId  bannerId
     * @apiParamExample {json} Input
     * {
     * "bannerId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Banner.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/banner/delete-banner
     * @apiErrorExample {json} bannerDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-banner')
    @Authorized(['admin', 'delete-banners'])
    public async deleteMultipleBanner(@Body({ validate: true }) bannerDelete: DeleteBannerRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({bannerFlag:currentDate}).execute()
        const bannerIdNo = bannerDelete.bannerId.toString();
        const bannerid = bannerIdNo.split(',');
        for (const id of bannerid) {
            const dataId = await this.bannerService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please choose a banner that you want to delete.',
                };
                return response.status(400).send(errorResponse);
            } else {
                const deleteBannerId = parseInt(id, 10);
                await this.bannerService.delete(deleteBannerId);
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully deleted Banner.',
        };
        return response.status(200).send(successResponse);
    }

    // Banner Count API
    /**
     * @api {get} /api/banner/banner-count Banner Count API
     * @apiGroup Banner
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get banner count",
     *      "data":{},
     *      "status": "1"
     * }
     * @apiSampleRequest /api/banner/banner-count
     * @apiErrorExample {json} Banner error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/banner-count')
    @Authorized()
    public async bannerCount(@Res() response: any): Promise<any> {
        const banner: any = {};
        const select = [];
        const search = [];
        const WhereConditions = [];
        const allBannerCount = await this.bannerService.list(0, 0, select, search, WhereConditions, 1);
        const whereConditionsActive = [
            {
                name: 'isActive',
                op: 'like',
                value: 1,
            },
        ];
        const activeBannerCount = await this.bannerService.list(0, 0, select, search, whereConditionsActive, 1);
        const whereConditionsInActive = [
            {
                name: 'isActive',
                op: 'like',
                value: 0,
            },
        ];
        const inActiveBannerCount = await this.bannerService.list(0, 0, select, search, whereConditionsInActive, 1);
        banner.totalBanner = allBannerCount;
        banner.activeBanner = activeBannerCount;
        banner.inActiveBanner = inActiveBannerCount;
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the banner count',
            data: banner,
        };
        return response.status(200).send(successResponse);
    }

    // Blog Detail
    /**
     * @api {get} /api/banner/banner-detail Banner Detail API
     * @apiGroup Banner
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} bannerId BannerId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Banner detail",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/banner/banner-detail
     * @apiErrorExample {json} banner Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/banner-detail')
    @Authorized()
    public async BannerDetail(@QueryParam('bannerId') bannerId: number, @Res() response: any): Promise<any> {
        const banner = await this.bannerService.findOne({
            where: {
                bannerId,
            },
        });
        if (!banner) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Banner Id',
            };
            return response.status(400).send(errorResponse);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully got banner detail',
            data: banner,
        };
        return response.status(200).send(successResponse);
    }

    // Banner Excel Document download
    /**
     * @api {get} /api/banner/banner-excel-list Banner Excel
     * @apiGroup Banner
     * @apiParam (Request body) {String} bannerId bannerId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Banner Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/banner/banner-excel-list
     * @apiErrorExample {json} banner Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/banner-excel-list')
    public async bannerView(@QueryParam('bannerId') bannerId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('banner excel Sheet');
        const rows = [];
        if (bannerId === '') {
            const errorResponse: any = {
                status: 0,
                message: 'choose atleast one banner',
            };
            return response.status(400).send(errorResponse);
        }
        const bannerid = bannerId.split(',');
        for (const id of bannerid) {
            const dataId = await this.bannerService.findOne({ where: { bannerId: id } });
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid bannerId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        worksheet.columns = [
            { header: 'title', key: 'title', size: 16, width: 15 },
            { header: 'link', key: 'link', size: 16, width: 15 },
            { header: 'position', key: 'position', size: 16, width: 15 },
            { header: 'image url', key: 'image', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of bannerid) {
            const dataId = await this.bannerService.findOne(id);
            const image = env.imageUrl + '?path=' + dataId.imagePath + '&name=' + dataId.image + '&width=100&height=100';
            rows.push([dataId.title, dataId.link, dataId.position, image]);
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './BannerExcel_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }




    // Banner and Visitor 
    /**
     * @api {post} /api/banner/secure/visitor Banner and Visitor
     * @apiGroup Banner
     * @apiParam (Request body) {String} visitorType visitorType
     * @apiParam (Request body) {String} userId userId
     * @apiParam (Request body) {Number} bannerId bannerId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Data addedd successfully.",
     *      "status": "200",
     *      "data": {},
     * }
     * @apiSampleRequest /api/banner/secure/visitor
     * @apiErrorExample {json} visitor List error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/visitor")
    public async visitorCount(@Body() rawData: any = {}, @Req() request: any, @Res() res: any): Promise<any> {
        const visitorRep = getManager().getRepository(VisitorModel);
        let visitor = new VisitorModel();
        visitor.visitorType = rawData.visitorType;
        visitor.counter = 1;
        visitor.userId = rawData.userId;
        visitor.ipAddress = (request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress).split(',')[0];
        visitor.bannerId = rawData.bannerId;
        try {
            await visitorRep.save(visitor);
            return res.status(200).send(await this._m.getMessage(200)).end();
        } catch (e) {
            return res.status(500).send(await this._m.getMessage(500)).end();
        }
    }

    // Banner and Visitor 
    /**
     * @api {post} /api/banner/secure/get-visitor Banner and Visitor List
     * @apiGroup Banner
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "List found..!!",
     *      "status": "200",
     *      "data": {},
     * }
     * @apiSampleRequest /api/banner/secure/visitor
     * @apiErrorExample {json} visitor List error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/get-visitor")
    public async getVisitoCount(@Req() request: any, @Res() res: any): Promise<any> {
        let js = await this.bannerService.visitorInfo();
        return res.status(200).send(await this._m.getMessage(200, js)).end();

    }




    // Banner Counter 
    /**
     * @api {get} /api/banner/secure/get-banner-counter Banner Counter
     * @apiGroup Banner
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "List found..!!",
     *      "status": "200",
     *      "data": {},
     * }
     * @apiSampleRequest /api/banner/secure/visitor
     * @apiErrorExample {json} visitor List error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get("/secure/get-banner-counter")
    //@Authorized(['admin'])
    public async getBannerCounter(@Req() request: any, @Res() res: any): Promise<any> {
        let js = await this.bannerService.bannerCounter();
        if (js.length > 0) {
            return res.status(200).send(await this._m.getMessage(200, js)).end();
        } else {
            return res.status(300).send(await this._m.getMessage(300, js)).end();
        }

    }
}
