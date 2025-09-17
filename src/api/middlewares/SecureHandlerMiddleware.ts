//import {commonService} from "../common/commonService"
//import { env } from '../../env';

export function secureTokenChecks(request: any, response: any, next?: (err?: any) => any): any {

    if(!request.headers['REDCHIEF-TOKEN']){
        return response.status("404").send({status:"404",data : "INVALID REQUEST",message:"Invalid Request"}).end();
      }else{
        let originalToken = request.headers['REDCHIEF-TOKEN'];
        let sArrString = Buffer.from(originalToken, 'base64').toString('ascii');
        let keyStringRaw = sArrString.split("#s-r")[0];
        let keyStringRawStr = keyStringRaw.replace(/aTmopp/g,"a");
        let keyString = Buffer.from(keyStringRawStr, 'base64').toString('ascii');
        if(keyString === "hash2 keyword uses for the encryption as string"){
          let dateStringRawArr = sArrString.split("#s-r")[1];
          let dateStringRaw = dateStringRawArr.split("?p-r")[0];
          let dateStringStr = Buffer.from(dateStringRaw, 'base64').toString('ascii');
    
          var dt = new Date(dateStringStr);
          dt.setMinutes( dt.getMinutes() + 15 );
         if(dt < new Date()){
          return response.status("401").send({status:"401",data : "INVALID REQUEST",message:"Unauthorized Access"}).end();
         }else{
          let lastParam = dateStringRawArr.split("?p-r")[1];
          if(Buffer.from(lastParam, 'base64').toString('ascii') != 'encryption' ){
            return response.status("401").send({status:"401",data : "INVALID REQUEST",message:"Unauthorized Access"}).end();
          }else{
            next();
          }
         }
        }else{
          return response.status("401").send({status:"401",data : "INVALID REQUEST",message:"Unauthorized Access"}).end();
        }
      }
}
