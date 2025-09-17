import { IsNotEmpty } from 'class-validator';
import {
    BeforeInsert,
     BeforeUpdate,
     Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('appointment')
export class AppointmentSlot extends BaseModel{

   
    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public id: number;

    @Column({ name: 'calendar_period' })
    public calendarPeriod: string;

    @Column({ name: 'booking_not_allowed_days' })
    public bookingNotAllowedDays: string;

    @Column({ name: 'saturday_off' })
    public saturdayOff: string;

    @Column({ name: 'sunday_off' })
    public sundayOff: string;

    @Column({ name: 'start_time' })
    public startTime: string;
    
    @Column({ name: 'end_time' })
    public endTime: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    
}
