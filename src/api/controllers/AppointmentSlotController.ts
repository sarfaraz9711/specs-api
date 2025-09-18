import 'reflect-metadata';
import {
    Body,
    Get,
    JsonController,
    Post,

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { AppointmentSlot } from '../models/AppointmentSlotModel';
import moment from 'moment';
@JsonController('/appointment')
export class AppointmentSlotController {
    constructor() {
    }
  

@Post('/save')
public async saveAppointment(@Body() request:any){
    const appointment = getManager().getRepository(AppointmentSlot)  
    const result:any = await appointment.save(request) 
    return {status:200, message:'success', data:result}

}


@Post('/update')
public async updateAppointment(@Body() request:any){
    const appointment = getManager().getRepository(AppointmentSlot)  
    const result:any = await appointment.update(request.id, request) 
    return {status:200, message:'success', data:result}

}



@Get('/get-appointment-list')
public async getAppointmentList(): Promise<any> {
    const appointment = getManager().getRepository(AppointmentSlot)
    const result = await appointment.findOne({
        order: { id: 'DESC' }
      });
    return {status:200, message:'success', data:result}
}
    @Post('/appointment-list')
    public async appointmentList(@Body() request:any): Promise<any> {
        let resposnse:any={}
        try{
        const appointment = getManager().getRepository(AppointmentSlot)
        const result:any = await appointment.findOne({
            order: { id: 'DESC' }
          });
            console.log(result)
            const { saturday, sunday } = this.getNextWeekendDates();
if(result.saturdayOff=='YES'){
    result.bookingNotAllowedDays+=`,${moment(saturday).format('YYYY-MM-DD')}`
}
if(result.sundayOff=='YES'){
    result.bookingNotAllowedDays+=`,${moment(sunday).format('YYYY-MM-DD')}`
}

const bookedSlot = await getManager().query(`SELECT GROUP_CONCAT(appointment_time) bookedSlot FROM appointment_booked WHERE appointment_date='${request.findDate}' and is_active=1`)
console.log(bookedSlot)
result.bookedDate = request.findDate
result.bookedSlot = bookedSlot[0].bookedSlot
        resposnse={status:200, message:'success', data:result}
       
        }catch{
            resposnse={status:500, message:'Error', data:null}
        }

        return resposnse
    }

    getNextWeekendDates() {
        const today = new Date();
        const day = today.getDay(); // Sunday = 0, Monday = 1, ... Saturday = 6
      
        // Days until Saturday (6)
        const daysUntilSaturday = (6 - day + 7) % 7 || 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
      
        // Days until Sunday (0)
        const daysUntilSunday = (7 - day) % 7 || 7;
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + daysUntilSunday);
      
        return { saturday, sunday };
      }

}
