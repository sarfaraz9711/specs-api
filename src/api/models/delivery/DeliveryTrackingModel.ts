import { IsNotEmpty,IsEmpty } from 'class-validator';
import moment from 'moment';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
@Entity('tm_delivery_expected_delhivery')
export class DeliveryPartenerModel extends BaseModel{
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsEmpty()
    @Column({ name: 'origin' })
    public origin: string;

    @IsEmpty()
    @Column({ name: 'destination' })
    public destination: string;

    @IsEmpty()
    @Column({ name: 'forward_surface_cutoff' })
    public forwardSurfaceCutoff: string;

    @IsEmpty()
    @Column({ name: 'forward_surface_tat' })
    public forwardSurfaceTat: string;

    @IsEmpty()
    @Column({ name: 'forward_express_cutoff' })
    public forwardExpressCutoff: string;

    @IsEmpty()
    @Column({ name: 'forward_express_tat' })
    public forwardExpressTat: string;

    @IsEmpty()
    @Column({ name: 'heavy_cutoff' })
    public heavyCutoff: string;

    @IsEmpty()
    @Column({ name: 'heavy_tat' })
    public heavyTat: string;

    @IsEmpty()
    @Column({ name: 'delivery_partener' })
    public deliveryPartener: string;

    @IsEmpty()
    @Column({ name: 'pincode' })
    public pincode: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}