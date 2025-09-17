import { IsNotEmpty,IsEmpty } from 'class-validator';
import moment from 'moment';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
@Entity('tm_tat_matrix')
export class TatMatrixModel extends BaseModel{
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsEmpty()
    @Column({ name: 'file_type' })
    public fileType: string;

    @IsEmpty()
    @Column({ name: 'file_path' })
    public filePath: string;
    @IsEmpty()
    @Column({ name: 'STATUS' })
    public status: number;
    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}