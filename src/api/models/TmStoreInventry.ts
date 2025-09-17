import { IsEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { BaseModel } from './BaseModel';
import { Maps } from './Maps';

@Entity({name:'tm_store_inventory'})
export class TmStoreInventory extends BaseModel{
    @PrimaryGeneratedColumn()
    public id : number;

    @ManyToOne(() => Maps , (map) => map.storeFk,{
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
    })
    public storeIdFK: Maps;
	
    @IsEmpty()
    @Column({ name: 'product_id',nullable: false})
    public productId: number;

    @IsEmpty()
    @Column({ name: 'sku',nullable: false })
    public sku: string;
	
	@IsEmpty()
    @Column({ name: 'quantity',nullable: true })
    public productQuantity	: number;
	
	@IsEmpty()
    @Column({ name: 'status',nullable: false })
    public status	: string;
}