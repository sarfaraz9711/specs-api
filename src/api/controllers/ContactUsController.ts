import 'reflect-metadata';
import { Get, QueryParam, JsonController, Res, Req, Post } from 'routing-controllers';
import { ContactService } from '../services/ContactUsService';
//import { Contact } from '../models/Contact';
import { classToPlain } from 'class-transformer';
import { CommonService } from "../common/commonService";
@JsonController('/contact-us')
export class ContactUsController {
    constructor(private contactUsService: ContactService,
                private _m: CommonService) {
    }
    // Contact Us List API
    /**
     * @api {get} /api/contact-us/contactus-list Contact Us List API
     * @apiGroup Contact Us
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete contact us list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/contact-us/contactus-list
     * @apiErrorExample {json} Contact error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/contactus-list')
      public async findAll(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number, @Res() response: any): Promise<any> {
        const contactUs = await this.contactUsService.list(limit, offset, keyword, count);
        if (contactUs) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(contactUs), "Successfully get All List"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }
	
	// Contact Us Count API
    /**
     * @api {post} /api/contact-us/contactus-count  Contact Us Count API
     * @apiGroup Contact Us 
     * @apiParam (Request body) {String} date_value date_value
     * @apiParamExample {json} Input
     * {
     *      "date_value" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Contact Us Count.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/contact-us/contactus-count
     * @apiErrorExample {json} countContactUs error
     * HTTP/1.1 500 Internal Server Error
     */
	@Post('/contactus-count')
      public async findCount(@Req() req: any, @Res() response: any ): Promise<any> {
        const contactUs = await this.contactUsService.count();
		const today = req.body.date_value;
		   var todaycount=0;
		for(let i=0;i<contactUs.length;i++){
		const contactUsDate=(contactUs[i].createdDate.getFullYear().toString().concat('-')).concat(((contactUs[i].createdDate.getMonth()+1).toString().concat('-'))).concat(contactUs[i].createdDate.getDate().toString());

			if(today==contactUsDate){
				 todaycount=todaycount+1;
			}
		}
		 const totalContactUsCount=contactUs.length;
        if (contactUs) {
			const successResponse: any = {
                status: 1,
                message: 'Successfully get Contact Us Count',
                TotalCount: totalContactUsCount,
				TodayCount: todaycount,
            };
            return response.status(200).send(successResponse);
        } else {
			const errorResponse: any = {
                status: 1,
                message: 'Unable to get the Contact Us Count. ',
            };
			  return response.status(400).send(errorResponse);

        }
    }
	
  	

}
