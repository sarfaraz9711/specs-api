import 'reflect-metadata';
import {
    Body,
    Get,
    JsonController,
    Post,

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { Service } from '../models/services';
@JsonController('/services')
export class ServicesController {
    constructor() {
    }
    @Post('/save')
    public async saveList(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const data = getManager().getRepository(Service)
            const result: any = await data.save(request)
            console.log(result)

            resposnse = { status: 200, message: 'success', data: result }

        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

    @Post('/update-services')
    public async updateServices(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const data = getManager().getRepository(Service)

            const result: any = await data.update(request.id, request)
            console.log(result)

            resposnse = { status: 200, message: 'success', data: result }

        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

   
   @Get('/get-all-item')
   public async getAllServices(): Promise<any> {
       const repository = getManager().getRepository(Service)
       const result = await repository.find();
       return {status:200, message:'success', data:result}
   }
}