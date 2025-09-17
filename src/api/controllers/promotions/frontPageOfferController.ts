import 'reflect-metadata';
import {
    Post,
   // Body,
    JsonController,
    //Authorized,
    Res,
    Req,
    Get,
    Authorized,
    QueryParams
} from 'routing-controllers';
import { FrontPageOffer } from '../../models/Promotions/frontPageOffer/frontPageOfferModel';
import { getManager } from 'typeorm';
import { FrontPageOfferService } from '../../services/promotions/FrontPageOffer/FrontPageOfferService';
import { Settings } from '../../models/Setting';


@JsonController('/offer')
export class AddressController {
    constructor(private frontPageOfferService: FrontPageOfferService,

                ) {
    }

    // Create Front page Offer
    /**
     * @api {post} /api/offer/add-front-page-offer Add Front Page Offer API
     * @apiGroup Address
     * @apiParam (Request body) {Number} customerId customerId
     * @apiParam (Request body) {String} address1 address1
     * @apiParam (Request body) {String} address2 address2
     * @apiParam (Request body) {String} city city
     * @apiParam (Request body) {String} state state
     * @apiParam (Request body) {Number} postcode postcode
     * @apiParam (Request body) {Number} addressType addressType
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "customerId" : "",
     *      "address1" : "",
     *      "address2" : "",
     *      "city" : "",
     *      "state" : "",
     *      "postcode" : "",
     *      "addressType" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New Address is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/address/add-address
     * @apiErrorExample {json} addAddress error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-front-page-offer')
   @Authorized(['admin', 'add-customer-address'])
    public async createAddress(@Req() request:any, @Res() response: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({frontImagesFlag:currentDate}).execute()
             let FrontPageOfferParams:any=request.body
             if(FrontPageOfferParams.showOn=="left" || FrontPageOfferParams.showOn=="right"){
             const frontPageModel = getManager().getRepository(FrontPageOffer)
             await frontPageModel.createQueryBuilder().update().set({status: 0}).where('show_on=:showOn',{showOn: FrontPageOfferParams.showOn}).execute()
             }
             const frontpageOfferSave = await this.frontPageOfferService.create(FrontPageOfferParams);
            if (frontpageOfferSave) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created front page offer.',
                    data: frontpageOfferSave,
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Unable to create new front page offer. ',
                };
                return response.status(400).send(errorResponse);
            }
        

    }

    @Get('/front-page-offer-list')
    public async frontpageofferList(@QueryParams() query:any, @Res() response: any): Promise<any> {
        console.log("queryquery",query)
        const frontpageofferList = await this.frontPageOfferService.findAll();
        if (frontpageofferList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got complete front page offer list.',
                data: frontpageofferList,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to get the address list. ',
            };
            return response.status(400).send(errorResponse);
        }
    }


    @Get('/front-page-offer-section')
    public async getDataBykeyword(@QueryParams() query:any, @Res() response: any): Promise<any> {
        let frontpageofferList:any[]=[]
    if((query.showOn).toUpperCase()=='FOOTWEAR' || (query.showOn).toUpperCase()=='GARMENTS' || (query.showOn).toUpperCase()=='CATEGORY'){
        frontpageofferList = await this.frontPageOfferService.find({
            where:{"content":query.showOn,status:1},
            order:{"Id":"DESC"}
        });
    }else if(query.showOn!="allOffer"){
        frontpageofferList = await this.frontPageOfferService.find({
            where:{"showOn":query.showOn,status:1},
            order:{"Id":"DESC"}
        });
    }else{
        const offer1:any  = await this.frontPageOfferService.findOne({
             where:{"showOn":"offerTab1",status:1},
             order:{"Id":"DESC"}
         });
         if(offer1){
         frontpageofferList.push(offer1)
         }
         const offer2:any  = await this.frontPageOfferService.findOne({
              where:{"showOn":"offerTab2",status:1},
              order:{"Id":"DESC"}
          });
          if(offer2){
          frontpageofferList.push(offer2)
          }
          const offer3:any = await this.frontPageOfferService.findOne({
               where:{"showOn":"offerTab3",status:1},
               order:{"Id":"DESC"}
           }); 
           if(offer3){
           frontpageofferList.push(offer3)
           }
    }
        if(query.showOn=="left" || query.showOn=="right" || query.showOn=="banner2" || query.showOn=="banner3"){
            frontpageofferList=frontpageofferList[0]
        }
        if (frontpageofferList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got complete front page offer list.',
                data: frontpageofferList,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 2,
                message: 'Unable to get the data. ',
            };
            return response.status(200).send(errorResponse);
        }
    }

    @Get('/front-page-offer-section-all')
    public async frontPageOfferSectionAll(@QueryParams() query:any, @Res() response: any): Promise<any> {
        let frontpageofferList:any

        frontpageofferList = await this.frontPageOfferService.find({
            where:{status:1, listType:query.listType},
            order:{"Id":"DESC"}
        })
        let result:any[]=[]
        let category:any[]=[]
        let subCategory:any[]=[]
        let furoMen:any[]=[]
        let furoWomen:any[]=[]
        let garments:any[]=[]
        let footwear:any[]=[]
        let other:any[]=[]
        frontpageofferList.forEach((element:any) => {
            if(element.content && ((element.content).toUpperCase())==='CATEGORY'){
                category.push(element)
            }else if(element.content && ((element.content).toUpperCase())==='SUB-CATEGORY'){
                subCategory.push(element)
            }else if(element.content && ((element.content).toUpperCase())==='GARMENTS'){
                garments.push(element)
            }else if(element.content && ((element.content).toUpperCase())==='FOOTWEAR'){
                footwear.push(element)
            }else if(element.content && ((element.content).toUpperCase())==='FURO-MEN-CATEGORY'){
                furoMen.push(element)
            }else if(element.content && ((element.content).toUpperCase())==='FURO-WOMEN-CATEGORY'){
                furoWomen.push(element)
            }else if(element.showOn && ((element.showOn).toUpperCase())==='FURO-VIDEO'){
                result.push({'video':element})    
            }else if(element.showOn && ((element.showOn).toUpperCase())==='RIGHT'){
                result.push({'right':element})    
            }else if(element.showOn && ((element.showOn).toUpperCase())==='LEFT'){
                result.push({'left':element})    
            }else if(element.showOn && ((element.showOn).toUpperCase())==='BANNER2'){
                result.push({'banner2':element})    
            }else if(element.showOn && ((element.showOn).toUpperCase())==='BANNER3'){
                result.push({'banner3':element})    
            }else{
                other.push(element)
            }
        });
        
        result.push({category}, {garments}, {footwear}, {subCategory}, {furoMen}, {furoWomen})
        if (frontpageofferList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got complete front page offer list.',
                data: result,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 2,
                message: 'Unable to get the data. ',
            };
            return response.status(200).send(errorResponse);
        }
    }

    @Get('/offer-status-update')
    public async offerStatusUpdate(@QueryParams() query:any, @Res() response: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({frontImagesFlag:currentDate}).execute()
        const _offerPage = getManager().getRepository(FrontPageOffer)
        const frontpageofferList = await _offerPage.createQueryBuilder().update().set({status:query.status}).where("id=:id", {id: query.id}).execute();
        const result = await this.frontPageOfferService.find({ where: { status: 1 } });
        if (frontpageofferList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully update the status.',
                data: result,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Simething went wrong',
            };
            return response.status(400).send(errorResponse);
        }
    }

    @Post('/offer-banner-update')
    public async offerBannerUpdate(@Req() request:any, @QueryParams() query:any, @Res() response: any): Promise<any> {
        const currentDate:any = (new Date().getTime()).toString()
        const _setting = getManager().getRepository(Settings)
        _setting.createQueryBuilder().update().set({frontImagesFlag:currentDate}).execute()
        const requestBody = request.body;
        
        const _offerPage = getManager().getRepository(FrontPageOffer)
        const frontpageofferList = await _offerPage.createQueryBuilder().update()
        .set(requestBody)
        .where("id=:pid", {pid: query.editId}).execute();

        
        const result = await this.frontPageOfferService.find({ where: { Id: query.editId } });
        if (frontpageofferList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully update the status.',
                data: result,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Simething went wrong',
            };
            return response.status(400).send(errorResponse);
        }
    }


}

