import { IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "../BaseModel";

@Entity('tm_store_state_city_master')
export class StoreStateCityModel extends BaseModel {
    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public Id: number;

    
    @Column({ name: 'StateCode' })
    public StateCode: string;

    
    @Column({ name: 'StoreState' })
    public StoreState: string;

    
    @Column({ name: 'CityName' })
    public CityName: string;

    
    @Column({ name: 'CityCode' })
    public CityCode: string;

    @Column({ name: 'PinCode' })
    public PinCode: string;

    @Column({ name: 'DistrictName' })
    public DistrictName: string;

    @Column({ name: 'DistrictCode' })
    public DistrictCode: string;

    
}