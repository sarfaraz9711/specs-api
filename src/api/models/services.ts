import { Column, PrimaryGeneratedColumn, Entity, BeforeUpdate, BeforeInsert } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';
@Entity('service')
export class Service extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn()
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'title' })
    public title: string;
    @IsNotEmpty()
    @Column({ name: 'content' })
    public content: string;
    @Column({ name: 'is_active' })
    public isActive: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
