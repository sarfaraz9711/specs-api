import { IsEmpty, IsNotEmpty } from "class-validator";
import moment from "moment";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "../BaseModel";

@Entity('tm_facility_sku_mapping')
export class FacilitySkuModel extends BaseModel {
    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public Id: number;

    @IsNotEmpty()
    @Column({ name: 'facility_code' })
    public facilityCode: string;

    @IsNotEmpty()
    @Column({ name: 'sku' })
    public sku: string;

    @IsEmpty()
    @Column({ name: 'quantity' })
    public Quantity: number;

    @IsNotEmpty()
    @Column({ name: 'status' })
    public status: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}