import moment from 'moment';
import {
    BeforeInsert,
    BeforeUpdate,
    Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';
import { BaseModel } from './BaseModel';
@Entity('facility')

export class FacilityMap  extends BaseModel{

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;
    
    @Column({ name: 'facility_name' })
    public facilityName: string;
    
    @Column({ name: 'facility_code' })
    public facilityCode: string;

    @Column({ name: 'pincode' })
    public pincode: number;

    @Column({name: "status"})
    public status : string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
