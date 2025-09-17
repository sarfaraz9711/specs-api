import { IsEmpty, IsNotEmpty } from "class-validator";
import moment from "moment";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "./BaseModel";

@Entity('tt_visitor_count')
export class VisitorModel extends BaseModel {

    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsNotEmpty()
    @Column({ name: 'visitorType' })
    public visitorType: string;

    @IsEmpty()
    @Column({ name: 'counter' })
    public counter: number;

    @IsEmpty()
    @Column({ name: 'userId' })
    public userId: string;

    @IsEmpty()
    @Column({ name: 'ipAddress' })
    public ipAddress: string;

    @IsEmpty()
    @Column({ name: 'bannerId' })
    public bannerId: string;
    
    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}