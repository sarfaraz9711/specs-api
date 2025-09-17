import { IsEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { BaseModel } from './BaseModel';
import { Pinlabs } from './Pinelabs';

@Entity({name:'tt_pine_labs_orders'})
export class Pinelabsorders extends BaseModel{
    @PrimaryGeneratedColumn()
    public id : number;

    
    
    @ManyToOne(() => Pinlabs , (pno) => pno.pineLabsFkOrder)
    public pineLabsFk: Pinlabs;


    @IsEmpty()
    @Column({ name: 'product_code',nullable: true})
    public productCode: string;

    @IsEmpty()
    @Column({ name: 'product_amount',nullable: true })
    public productAmount: string;

}