import { IsEmpty, IsNotEmpty} from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import { BaseModel } from './BaseModel';
import { TmStoreInventory } from './TmStoreInventry';


@Entity({name:'tm_store'})
export class Maps extends BaseModel{
    @IsNotEmpty()
    @PrimaryGeneratedColumn({name: 'id'})
    public id : number;
	
	@OneToMany(() => TmStoreInventory, (storeinventory) => storeinventory.storeIdFK, {
        cascade : true
    })
    public storeFk: TmStoreInventory[];
	
   
    @IsEmpty()
    @Column({
        type: 'text', name: 'pincode' 
    })
    public pincode: string;

    @IsEmpty()
    @Column({ 
        name: 'latitude', nullable: true,
    })
    public latitude: string;

    @IsEmpty()
    @Column({ name: 'longitude', nullable: true,
    })
    public longitude: string;

    @IsEmpty()
    @Column({ name: 'shop_name', nullable: true,
    })
    public shopName: string;

    @IsEmpty()
    @Column({ name: 'address',nullable: true, })
    public address: string;

    @IsEmpty()
    @Column({ name: 'store_opening_time',nullable: true, })
    public storeOpeningTime: string;

    @IsEmpty()
    @Column({ name: 'store_closing_time',nullable: true, })
    public storeClosingTime: string;


    @IsEmpty()
    @Column({ name: 'contact_no',nullable: true, })
    public contactNo: string;

    @IsEmpty()
    @Column({ name: 'quantity',nullable: true, default: 0 })
    public quantity: string;
	
	@IsEmpty()
    @Column({ name: 'city_id',nullable: true, })
    public cityId: number;
	
	@IsEmpty()
    @Column({ name: 'ref_num',nullable: true, })
    public refNum: string;
	
	@IsEmpty()
    @Column({ name: 'first_name',nullable: true, })
    public firstName: string;
	
	@IsEmpty()
    @Column({ name: 'store_legal_name',nullable: true, })
    public storeLegalName: string;
	
	@IsEmpty()
    @Column({ name: 'shop_no',nullable: true, })
    public shopNo: string;
	
	@IsEmpty()
    @Column({ name: 'business_name',nullable: true, })
    public businessName: string;
	
	@IsEmpty()
    @Column({ name: 'percentage_commision',nullable: true, })
    public percentageCommision: string;
	
	@IsEmpty()
    @Column({ name: 'staff_strength',nullable: true, })
    public staffStrength: string;
	
	@IsEmpty()
    @Column({ name: 'annual_turnover',nullable: true, })
    public annualTurnover: string;
	
	@IsEmpty()
    @Column({ name: 'year_of_company_foundation',nullable: true, })
    public yearOfCompanyFoundation: string;
	
	@IsEmpty()
    @Column({ name: 'sales_experience',nullable: true, })
    public salesExperience: string;
	
	@IsEmpty()
    @Column({ name: 'client_name',nullable: true, })
    public clientName: string;
	
	@IsEmpty()
    @Column({ name: 'active',nullable: true, })
    public active: string;
	
	@IsEmpty()
    @Column({ name: 'is_order_mail',nullable: true, })
    public isOrderMail: string;
	
	@IsEmpty()
    @Column({ name: 'email_id',nullable: true, })
    public emailId: string;
	
	@IsEmpty()
    @Column({ name: 'shipper_name',nullable: true, })
    public shipperName: string;
	
	@IsEmpty()
    @Column({ name: 'store_type_vendor',nullable: true, })
    public storeTypeVendor: string;
	
	@IsEmpty()
    @Column({ name: 'store_type',nullable: true, })
    public storeType: string;
	
	@IsEmpty()
    @Column({ name: 'address_2',nullable: true, })
    public address2: string;
	
	@IsEmpty()
    @Column({ name: 'store_country',nullable: true, })
    public storeCountry: string;
	
	@IsEmpty()
    @Column({ name: 'store_state',nullable: true, })
    public storeState: string;
	
	@IsEmpty()
    @Column({ name: 'store_city',nullable: true, })
    public storeCity: string;
	
	@IsEmpty()
    @Column({ name: 'mobile_no',nullable: true, })
    public mobileNo: string;
	
	@IsEmpty()
    @Column({ name: 'is_store_shipper',nullable: true, })
    public isStoreShipper: string;
	
	@IsEmpty()
    @Column({ name: 'is_warehouse',nullable: true, })
    public isWarehouse: string;
	
	@IsEmpty()
    @Column({ name: 'is_asp',nullable: true, })
    public isAsp: string;
	
	@IsEmpty()
    @Column({ name: 'is_web_online',nullable: true, })
    public isWebOnline: string;
	
	@IsEmpty()
    @Column({ name: 'is_store',nullable: true, })
    public isStore: string;
	
	@IsEmpty()
    @Column({ name: 'is_deliver_store',nullable: true, })
    public isDeliverStore: string;
	
	@IsEmpty()
    @Column({ name: 'is_order_store',nullable: true, })
    public isOrderStore: string;

	@IsEmpty()
    @Column({ name: 'city_code',nullable: true, })
    public cityCode: string;

    @IsEmpty()
    @Column({ name: 'store_opening_date',nullable: true, })
    public storeOpeningDate: string;

    @IsEmpty()
    @Column({ name: 'google_location',nullable: true, })
    public googleLocation: string;

    @IsEmpty()
    @Column({ name: 'store_code',nullable: true, })
    public storeCode: string;

}
