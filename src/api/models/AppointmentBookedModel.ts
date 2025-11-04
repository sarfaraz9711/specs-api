import { IsNotEmpty } from 'class-validator';
import {
    BeforeInsert,
     BeforeUpdate,
     Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('appointment_booked')
export class AppointmentBooked extends BaseModel{

   
    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public id: number;

    @Column({ name: 'appointment_id' })
    public appointmentId: string;

    @Column({ name: 'user_id' })
    public userId: string;

    @Column({ name: 'mobile' })
    public mobile: string;

    @Column({ name: 'full_name' })
    public fullName: string;

    @Column({ name: 'address' })
    public address: string;

    @Column({ name: 'appointment_date' })
    public appointmentDate: string;

    @Column({ name: 'appointment_time' })
    public appointmentTime: string;
    
    @Column({ name: 'appointment_status' })
    public appointmentStatus: string;
    
    @Column({ name: 'remarks' })
    public remarks: string;
    
    @Column({ name: 'is_active' })
    public isActive: string;
    
    @Column({ name: 'agent_id' })
    public agentId: string;
    
    @Column({ name: 'order_id' })
    public orderId: string;
    
    @Column({ name: 'eye_pressure' })
    public eyePressure: string;
    
    @Column({ name: 'lens_type' })
    public lensType: string;
    
    @Column({ name: 'vision_left' })
    public visionLeft: string;
    
    @Column({ name: 'vision_right' })
    public visionRight: string;
    
    @Column({ name: 'agent_remarks' })
    public agentRemarks: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    
}
