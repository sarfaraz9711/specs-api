import { Service } from 'typedi';
//const axios = require('axios');
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UnicommerceResponseRepository } from '../../repositories/UnicommerceRepository';

@Service()
export class UnicommerceService {
   constructor(
      @OrmRepository() private unicommerceResponseRepository: UnicommerceResponseRepository,
      ) {
  }

    public async create(unicommercedata:any):Promise<any> {

        /*axios.get('https://gorest.co.in/public/v2/users').then(resp => {

         });
          let response={
            "successful": true,
   "message": "string",
   "errors": [
      {
         "code": 0,
         "fieldName": "string",
         "description": "string",
         "message": "string",
         "errorParams": {
            "additionalProp1": {},
            "additionalProp2": {},
            "additionalProp3": {}
         }
      }
   ],
   "warnings": [
      {
         "code": 0,
         "message": "string",
         "description": "string"
      }
   ],
   "saleOrderDetailDTO": {
      "code": "string",
      "displayOrderCode": "string",
      "channel": "string",
      "displayOrderDateTime": "2020-06-11T09:24:09.093Z",
      "status": "string",
      "created": "2020-06-11T09:24:09.093Z",
      "updated": "2020-06-11T09:24:09.093Z",
      "notificationEmail": "string",
      "notificationMobile": "string",
      "customerGSTIN": "123456789012341",
      "cod": true,
      "priority": 0,
      "currencyCode": "string",
      "customerCode": "string",
      "billingAddress": {
         "id": "string",
         "name": "string",
         "addressLine1": "string",
         "addressLine2": "string",
         "city": "string",
         "state": "string",
         "country": "string",
         "pincode": "string",
         "phone": "string",
         "email": "string"
      },
      "addresses": [
         {
            "id": "string",
            "name": "string",
            "addressLine1": "string",
            "addressLine2": "string",
            "city": "string",
            "state": "string",
            "country": "string",
            "pincode": "string",
            "phone": "string",
            "email": "string"
         }
      ],
      "customFieldValues": [
         {
            "fieldName": "string",
            "fieldValue": {},
            "valueType": "string",
            "displayName": "string",
            "required": true,
            "possibleValues": [
               "string"
            ]
         }
      ]
   }
          }
          return response;*/

          return this.unicommerceResponseRepository.save(unicommercedata);
          

    } 
}

