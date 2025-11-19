import 'reflect-metadata';
import {
    Body,
    Get,
    JsonController,
    Post,

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { PatientFeedback } from '../models/patientFeedback';
@JsonController('/feedback-patient')
export class PatientFeedbackController {
    constructor() {
    }
    @Post('/save')
    public async saveFeedback(@Body() request: any): Promise<any> {
         let resposnse: any = {}
        try {
            const data = getManager().getRepository(PatientFeedback)
            const result: any = await data.save(request)
            resposnse = { status: 200, message: 'success', data: result }
        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

    @Post('/update')
    public async updateFeedback(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const data = getManager().getRepository(PatientFeedback)
            const result: any = await data.update(request.id, request)
            resposnse = { status: 200, message: 'success', data: result }
        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

   

    @Get('/feedback-list')
    async getFeedbackList() {
        const repo = getManager().getRepository(PatientFeedback);
        const result = await repo.find();
        return {
            status: 200,
            message: 'success',
            data: result
        };
    }
}