/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Get, Put, Delete, Param, QueryParam, Post, Body, JsonController, Authorized, Res, Req, UploadedFile } from 'routing-controllers';
import { Page } from '../models/Page';
import { CreatePage } from './requests/CreatePageRequest';
import { PageService } from '../services/PageService';
import { UpdatePage } from './requests/UpdatePageRequest';
import { DeletePageRequest } from './requests/DeletePageRequest';
import { PageGroupService } from '../services/PageGroupService';
import { CommonService } from '../common/commonService';
import { S3Service } from '../services/S3Service';
import moment from 'moment';


@JsonController('/page')
export class PageController {
    constructor(private pageService: PageService, private pageGroupService: PageGroupService, private _m : CommonService, private _s3 : S3Service) {
    }

    // Create Page API
    /**
     * @api {post} /api/page/add-page Add Page API
     * @apiGroup Page
     * @apiParam (Request body) {String} title title
     * @apiParam (Request body) {String} content content
     * @apiParam (Request body) {String} metaTagTitle metaTagTitle
     * @apiParam (Request body) {String} pageGroupId pageGroupId
     * @apiParam (Request body) {String} metaTagContent metaTagContent
     * @apiParam (Request body) {String} metaTagKeyword metaTagKeyword
     * @apiParam (Request body) {String} pageSlug pageSlug
     * @apiParam (Request body) {Number} active active
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "title" : "",
     *      "content" : "",
     *      "metaTagTitle" : "",
     *      "pageGroupId" : "",
     *      "metaTagContent" : "",
     *      "metaTagKeyword" : "",
     *      "pageSlug" : "",
     *      "active" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New page is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/add-page
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-page')
    @Authorized(['admin', 'create-pages'])
    public async createPage(@Body({ validate: true }) pageParam: CreatePage, @Res() response: any): Promise<any> {
        const page = new Page();
        page.title = pageParam.title;
        page.content = pageParam.content;
        page.isActive = pageParam.active;
        page.pageGroupId = pageParam.pageGroupId;
        page.metaTagTitle = pageParam.metaTagTitle !== '' ? pageParam.metaTagTitle : pageParam.title;
        page.metaTagContent = pageParam.metaTagContent;
        page.metaTagKeyword = pageParam.metaTagKeyword;
        page.fileUrl = pageParam.fileUrl;
        const metaTagTitle = pageParam.pageSlug ? pageParam.pageSlug : pageParam.title;
        const data = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
        page.slugName = await this.validate_slug(data);
        const pageSave = await this.pageService.create(page);
        if (pageSave !== undefined) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully created a new page.',
                data: pageSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to create page.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Page List API
    /**
     * @api {get} /api/page/pagelist Page List API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get page list",
     *      "data":{
     *      "pageId" : "",
     *      "title" : "",
     *      "content" : "",
     *      "active" : "",
     *      "metaTagTitle" : "",
     *      "metaTagContent" : "",
     *      "metaTagKeyword" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/pagelist
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/pagelist')
    @Authorized(['admin', 'list-pages'])
    public async pageList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['pageId', 'title', 'pageGroupId', 'content', 'isActive', 'metaTagTitle', 'metaTagContent', 'metaTagKeyword', 'slugName'];
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
        const WhereConditions = [];
        const relations = [];
        const pageList = await this.pageService.list(limit, offset, select, relations, search, WhereConditions, count);
        if (count) {
            const successRes: any = {
                status: 1,
                message: 'Successfully got pages count',
                data: pageList,
            };
            return response.status(200).send(successRes);
        }
        const promise = pageList.map(async (result: any) => {
            const data: any = await this.pageGroupService.findOne({ where: { groupId: result.pageGroupId } });
            const temp: any = result;
            if (data) {
                temp.pageGroupName = data.groupName;
            } else {
                temp.pageGroupName = '';
            }
            return temp;
        });
        const value = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete list of pages. ',
            data: value,
        };
        return response.status(200).send(successResponse);
    }

    // Update Page API
    /**
     * @api {put} /api/page/update-page/:id Update Page API
     * @apiGroup Page
     * @apiParam (Request body) {Number} pageId pageId
     * @apiParam (Request body) {String} title title
     * @apiParam (Request body) {String} content content
     * @apiParam (Request body) {Number} pageGroupId pageGroupId
     * @apiParam (Request body) {Number} active active
     * @apiParam (Request body) {String} metaTagTitle metaTagTitle
     * @apiParam (Request body) {String} pageSlug pageSlug
     * @apiParam (Request body) {String} metaTagContent metaTagContent
     * @apiParam (Request body) {String} metaTagKeyword metaTagKeyword
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "pageId" : "",
     *      "title" : "",
     *      "content" : "",
     *      "pageGroupId" : "",
     *      "active" : "",
     *      "metaTagTitle" : "",
     *      "pageSlug" : "",
     *      "metaTagContent" : "",
     *      "metaTagKeyword" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": " Page is updated successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/update-page/:id
     * @apiErrorExample {json} updatePage error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-page/:id')
    @Authorized(['admin', 'edit-pages'])
    public async updatePage(@Body({ validate: true }) pageParam: UpdatePage, @Res() response: any): Promise<any> {
        const page = await this.pageService.findOne({
            where: {
                pageId: pageParam.pageId,
            },
        });
        if (!page) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid page id.',
            };
            return response.status(400).send(errorResponse);
        }
        page.title = pageParam.title;
        page.content = pageParam.content;
        page.isActive = pageParam.active;
        page.pageGroupId = pageParam.pageGroupId;
        page.metaTagTitle = pageParam.metaTagTitle !== '' ? pageParam.metaTagTitle : pageParam.title;
        page.metaTagContent = pageParam.metaTagContent;
        page.metaTagKeyword = pageParam.metaTagKeyword;
        page.fileUrl = pageParam.fileUrl;
        const metaTagTitle = pageParam.pageSlug ? pageParam.pageSlug : pageParam.title;
        const data = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
        page.slugName = await this.validate_slug(data, pageParam.pageId);
        const pageSave = await this.pageService.create(page);
        if (pageSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated the page.',
                data: pageSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the page.',
            };
            return response.status(400).send(errorResponse);
        }
    }
    // Delete Page API
    /**
     * @api {delete} /api/page/delete-page/:id Delete Page API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "pageId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted page.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/delete-page/:id
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-page/:id')
    @Authorized(['admin', 'delete-pages'])
    public async deletePage(@Param('id') id: number, @Res() response: any, @Req() request: any): Promise<any> {

        const page = await this.pageService.findOne({
            where: {
                pageId: id,
            },
        });
        if (!page) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid pageId.',
            };
            return response.status(400).send(errorResponse);
        }
        const deletePage = await this.pageService.delete(page);
        if (deletePage) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted the page.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete the page.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete Multiple Page API
    /**
     * @api {post} /api/page/delete-page Delete Multiple Page API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} pageId  pageId
     * @apiParamExample {json} Input
     * {
     * "pageId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/delete-page
     * @apiErrorExample {json} pageDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-page')
    @Authorized()
    public async deleteMultiplePage(@Body({ validate: true }) pageDelete: DeletePageRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const pageIdNo = pageDelete.pageId.toString();
        const pageid = pageIdNo.split(',');
        for (const id of pageid) {
            const dataId = await this.pageService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please choose a page that you want to delete.',
                };
                return response.status(400).send(errorResponse);
            } else {
                const deletePageId = parseInt(id, 10);
                await this.pageService.delete(deletePageId);
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully deleted the page.',
        };
        return response.status(200).send(successResponse);
    }

    // Page Count API
    /**
     * @api {get} /api/page/page-count Page Count API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get page count",
     *      "data":{},
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/page-count
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/page-count')
    @Authorized()
    public async pageCount(@Res() response: any): Promise<any> {
        const page: any = {};
        const select = [];
        const search = [];
        const WhereConditions = [];
        const relations = [];
        const allPageCount = await this.pageService.list(0, 0, select, relations, search, WhereConditions, 1);
        const whereConditionsActive = [
            {
                name: 'isActive',
                op: 'like',
                value: 1,
            },
        ];
        const activePageCount = await this.pageService.list(0, 0, select, relations, search, whereConditionsActive, 1);
        const whereConditionsInActive = [
            {
                name: 'isActive',
                op: 'like',
                value: 0,
            },
        ];
        const inActivePageCount = await this.pageService.list(0, 0, select, relations, search, whereConditionsInActive, 1);
        page.totalPage = allPageCount;
        page.activePage = activePageCount;
        page.inActivePage = inActivePageCount;
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the page count',
            data: page,
        };
        return response.status(200).send(successResponse);
    }

    // page Detail
    /**
     * @api {get} /api/page/page-detail Page Detail API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} pageId pageId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Page detail",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/page-detail
     * @apiErrorExample {json} page Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/page-detail')
    @Authorized()
    public async PageDetail(@QueryParam('pageId') pageId: number, @Res() response: any): Promise<any> {
        const page = await this.pageService.findOne({
            where: {
                pageId,
            },
        });
        if (!page) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Page Id',
            };
            return response.status(400).send(errorResponse);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully got page detail',
            data: page,
        };
        return response.status(200).send(successResponse);
    }

    public async validate_slug($slug: string, $id: number = 0, $count: number = 0): Promise<string> {
        const slugCount = await this.pageService.checkSlug($slug, $id, $count);
        if (slugCount) {
            if (!$count) {
                $count = 1;
            } else {
                $count++;
            }
            return await this.validate_slug($slug, $id, $count);
        } else {
            if ($count > 0) {
                $slug = $slug + $count;
            }
            return $slug;
        }
    }



    // page Detail Annual Report
    /**
     * @api {get} /api/page/annual-report Annual Report
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Annual Report",
     *      "data": "[{}]"
     *      "status": "200"
     * }
     * @apiSampleRequest /api/page/annual-report
     * @apiErrorExample {json} page Detail error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/annual-report')
     public async AnnualReportDetails(@Res() response: any): Promise<any> {
        let _r = await await this.pageService.getAnnualReport();
         return response.status(200).send(await this._m.getMessage(200,_r));
     }


     // page Detail Annual Report
    /**
     * @api {post} /api/page/annual-report-file-upload Annual Report
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully uploaded Annual Report",
     *      "data": "file.pdf"
     *      "status": "200"
     * }
     * @apiSampleRequest /api/page/annual-report-file-upload
     * @apiErrorExample {json} page Detail error
     * HTTP/1.1 500 Internal Server Error
     */
     @Authorized('admin')
     @Post('/annual-report-file-upload')
     public async fileUploadInpageGroup(@UploadedFile('file') file:any, @Res() res :any):Promise<any>{
        if(file){
            let fileBuffer = Buffer.from(file.buffer,'base64').toString();
            let _fullFile = (file.originalname).substring(0,(file.originalname).lastIndexOf('.'))+"_"+moment().unix()+""+ (file.originalname).substring((file.originalname).lastIndexOf('.'));
            let _res = await this._s3.fileUpload('Annual_Return/'+_fullFile,fileBuffer,'application/pdf',"yes");
            if(_res){
            }
            return res.status(200).send(await this._m.getMessage(200,_res));
        }else{
            let _r = {
                status : 200,
                data : "na",
                message : ""
            }
            return res.status(200).send(await this._m.getMessage(200,_r));
        }
        
     }





    /**
     * @api {post} /api/page/download/:fileUrl Download file
     * @apiGroup Download File
     * @apiParam (Request body) {String} fileUrl Donwload URL
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Donwload",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/page/download/:fileUrl
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/download/:fileUrl')
     public async downloadS3Files(@Res() res: any, @Req() req : any): Promise<any> {
         if(req.params && req.params.fileUrl){
             let rawData = req.params;
             let _str = Buffer.from(rawData.fileUrl,'base64').toString("utf8")//this._m.decrptData(rawData.fileUrl);
             if(_str){
                 try{
                    let _temp1 = (_str.split("/"));
                    if(_temp1.length>2){
                    _temp1.splice(0,3);
                    }
                    let fileName = _temp1[_temp1.length-1];
                    
                    let _fileFolderName = _temp1.join("/");
                    
                     res.attachment(fileName);
                     let filePipe = await this._s3.fileDownloadExtended(_fileFolderName);
                     //filePipe.pipe(res);
                     //return res.send(filePipe);
                     res.send(filePipe);
                 }catch(r){
                     return res.status(200).send(await this._m.getMessage('300','unable to download file 1'));
                 }
             }else{
                 return res.status(200).send(await this._m.getMessage('300','unable to download file 2'));
             }
         }else{
             return res.status(200).send(await this._m.getMessage('300','unable to download file 3')); 
         }
     }
}
