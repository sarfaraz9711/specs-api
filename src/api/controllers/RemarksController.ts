import 'reflect-metadata';
import { Post, JsonController, Body, Get, QueryParams } from 'routing-controllers';
import { getManager } from 'typeorm';
import { Remarks } from '../models/RemarksModel';
@JsonController('/remarks')
export class RemarksController {
    _remarkModel: any = getManager().getRepository(Remarks)
    constructor() { }
    @Post('/save-remarks')
    public async saveRemarks(@Body() payloadRequest: any): Promise<any> {
        await this._remarkModel.save(payloadRequest)
        return {
            status: 200,
            message: 'Remark saved successfully'
        }
    }
    @Get('/get-remarks')
    public async getRemakrs(@QueryParams() query: any) {
        const result = await this._remarkModel.find({ where: query })
        let response: any
        if (result.length > 0) {
            response = {
                status: 200,
                message: "Record found",
                data: result
            }
        } else {
            response = {
                status: 300,
                message: "No record found",
                data: null
            }
        }
        return response
    }

    @Get('/get-all-remarks')
    public async getAllRemakrs(@QueryParams() query: any) {
        const result = await this._remarkModel.find()
        let response: any
        if (result.length > 0) {
            response = {
                status: 200,
                message: "Record found",
                data: result
            }
        } else {
            response = {
                status: 300,
                message: "No record found",
                data: null
            }
        }
        return response
    }


}
