import 'reflect-metadata';
import {
    Body,
    JsonController,
    Post,
    Req,
    UseBefore,

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { AppointmentBooked } from '../models/AppointmentBookedModel';
import { CheckCustomerMiddleware } from '../middlewares/checkTokenMiddleware';
@JsonController('/book-appointment')
export class AppointmentSlotController {
    constructor() {
    }


    @Post('/save')
    public async appointmentList(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const appointment = getManager().getRepository(AppointmentBooked)
            request.appointmentId = new Date().getTime()
            const result: any = await appointment.save(request)
            console.log(result)

            resposnse = { status: 200, message: 'success', data: result }

        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

    @Post('/update-appointment')
    public async updateAppointmentTime(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const appointment = getManager().getRepository(AppointmentBooked)

            const result: any = await appointment.update(request.id, request)
            console.log(result)

            resposnse = { status: 200, message: 'success', data: result }

        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

    @Post('/get-appointment')
    public async getAppointmentByUser(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const result = await getManager()
                .getRepository(AppointmentBooked)
                .createQueryBuilder("a")
                .where("a.mobile = :mobile", { mobile: request.mobile })
                .andWhere("a.isActive = :isActive", { isActive: 1 })
                .andWhere(
                    "STR_TO_DATE(CONCAT(a.appointment_date, ' ', a.appointment_time), '%Y-%m-%d %h:%i %p') > NOW()"
                )
                .orderBy("a.appointment_date", "ASC")
                .getOne();
            console.log(result)
            if (result) {
                resposnse = { status: 200, message: 'success', data: result }
            } else {
                resposnse = { status: 300, message: 'No data found', data: null }
            }

        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }


    @Post('/check-appointment')
    public async checkAppointment(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const appointment = getManager().getRepository(AppointmentBooked)
            const result: any = await appointment.findOne({ where: { mobile: request.mobile, isActive: 1, appointmentDate: request.appointmentDate } })
            console.log(result)
            if (result) {
                resposnse = { status: 300, message: 'slot not available', data: result }
            } else {
                resposnse = { status: 200, message: 'Slot available', data: null }
            }


        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

    @Post('/get-all-appointment')
    public async getAllAppointmentByUser(@Body() request: any): Promise<any> {
        console.log('request', request)
        let resposnse: any = {}
        try {
            const repository = getManager().getRepository(AppointmentBooked)

            const result = await repository
                .createQueryBuilder("appointment")
                .where("appointment.isActive = :isActive", { isActive: 1 })
                .andWhere("appointment.appointmentDate = :date", { date: request.appointmentDate })
                .orderBy("appointment.appointment_date", "ASC")
                .getMany();

            if (result) {
                resposnse = { status: 200, message: 'success', data: result }
            } else {
                resposnse = { status: 300, message: 'No data found', data: null }
            }

        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }

        return resposnse
    }

    @UseBefore(CheckCustomerMiddleware)
    @Post('/get-agent-list')
    public async getAllAppointments(@Req() request: any, @Body() body: { appointmentDate?: string }): Promise<any> {
        const userId = request.user.id; 
        const appointmentRepo = getManager().getRepository(AppointmentBooked);
        let result = await appointmentRepo
                .createQueryBuilder('appointment')
            .where('appointment.agentId = :agentId', { agentId: userId })
            .andWhere("appointment.appointmentDate = :date", { date: body.appointmentDate })
            .getMany();

        console.log("daatta", body.appointmentDate, userId)
        return {
            status: 200,
            message: 'success',
            data: result
        };


    }

}