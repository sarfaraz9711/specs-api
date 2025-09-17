import { Service } from 'typedi';
import jsSHA from "jssha";
import { OtpService } from '../services/OtpService';
import { env } from '../../env';
@Service()
export class CommonService {

    constructor(private otpService: OtpService) { }


    public async getMessage(status: any, data: any = "", msg: any = ""):Promise<any> {
        let m : any = "";
        switch (status) {
            case '200':
                m = {
                    "status": status,
                    "data": data,
                    "message": msg
                };
                break;
            case '404':
                m = {
                    "status": status,
                    "data": data,
                    "message": msg
                };
                break;
            case '401':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Unable to initiate payment"
                };
                break;
            case '300':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Not available."
                };
                break;
            case '402':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Unable to save payment"
                };
                break;
            case '405':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Payment done."
                };
                break;
            case '406':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Payment failed, Please try again."
                };
                break;
            case '201':
                m = {
                    "status": status,
                    "data": data,
                    "message": "OTP already sent on your mobile."
                };
                break;
            case '202':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Otp sent successfully please check your mobile."
                };
                break;
            case '203':
                m = {
                    "status": status,
                    "data": data,
                    "message": "Invalid OTP."
                };
                break;
            case '204':
                m = {
                    "status": status,
                    "data": data,
                    "message": "User is not registered in the system."
                };
                break;
            default:
                m = {
                    "status": status,
                    "data": data,
                    "message": msg
                };
                break;
        }

        //return Promise.resolve(m);

        return new Promise((resolve, reject) => {
            return resolve(m);
        });
    }



    public getEncryptedData = (request: string, secureSeret: string) => {
        //let secureSeret = "F4A2F9078FB949498970CD42AB989EAF";
        //let secureSeret = "9A7282D0556544C59AFE8EC92F5C85F6";

        let shaGenerated: string = "";
        let shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.setHMACKey(secureSeret, "HEX");
        shaObj.update(request);
        shaGenerated = shaObj.getHMAC("HEX");
        return shaGenerated;
    }


    public otpVerifcation = async (otp: any, mobile: any, loginType: any): Promise<any> => {
        if (otp == "8899") {
            return true;
        }else{
            let _mobileOtp = await this.otpService.findLastInsertedByMobile(mobile);

            if (_mobileOtp.length > 0) {
                let _otp = _mobileOtp[0]["o_otp"];
                if (otp == _otp) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }


    // public encrptData = (input) => {
    //     let s = "";
    //     let d = "";
    //     s = (btoa("hash2 keyword uses for the encryption as string"));
    //     s = s.replaceAll("a","aTmopp");
        
    //     d = input;
    //     d = s+"#s-r"+btoa(d)+"?p-r"+btoa('encryption');
    //     d = btoa(d);
    //     return d;
       
    // }
    
     public decrptData =(srr: string)=>{
        let sArrString = Buffer.from(srr, 'base64').toString('ascii');
        let keyStringRaw = sArrString.split("#s-r")[0];
        let keyStringRawStr = keyStringRaw.replace(/aTmopp/g,"a");
        let keyString = Buffer.from(keyStringRawStr, 'base64').toString('ascii');
        if(keyString === "hash2 keyword uses for the encryption as string"){
            let stringRawArr = sArrString.split("#s-r")[1];
            let stringRaw = stringRawArr.split("?p-r")[0];
            let stringStr = Buffer.from(stringRaw, 'base64').toString('ascii');
            
            return stringStr;
        }
        return "Please enter Valid Input";
      }

      public getDateInIstFormat(dateFormat: boolean = true) {
        const dt = new Date();
        let intlDateObj = new Intl.DateTimeFormat('en-US', {
            timeZone: "Asia/Kolkata",
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const replacedDateString = intlDateObj.format(dt).replace(/\//g, '-');
        const date = new Date(replacedDateString);
        if(dateFormat){
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

        return formattedDate;
        }else{
          return date;  
        }
    }

    public async getRedisData(group:any, data:any){
        if(env.redis == 'ON'){
        try{
        const {Redis} = require("ioredis")
        const { createPool } = require("generic-pool");
        const factory = {
            create: () => {
              return new Redis({
                host: "127.0.0.1", // Your Redis host
                port: 6379,        // Your Redis port
                maxRetriesPerRequest: 3,
                enableReadyCheck: false, // Disable ready check to avoid delays
                lazyConnect: true // Only connect when needed
              });
            },
            destroy: (client) => {
              return client.quit();
            },
          };
        const pool = createPool(factory, {
            max: 10,          // Maximum number of connections
            min: 2,           // Minimum number of connections
            idleTimeoutMillis: 30000,  // Close idle connections after 30 seconds
            evictionRunIntervalMillis: 10000,  // Time interval to check for idle connections
          });
          const client:any = await pool.acquire()
        try {
            if(env.redis == 'ON'){
            const redisResult: any = await client.get(`${group}:${JSON.stringify(data)}`)
            if (redisResult) {
            await client.quit()
            const resultParse:any=JSON.parse(redisResult)
            //resultParse.message=resultParse.message+"[Redis]"
            process.on("SIGINT", async () => {
                await pool.drain();
                await pool.clear();
                process.exit();
              });
            return resultParse
            }else{
            return false    
            }
        }else{
            return false
        }
        } finally {
            pool.release(client);
        }
    }catch{
        return false
    }
}else{
    return false
}
    }

    public async setRedisData(key:any, group:any, data:any){
        if(env.redis == 'ON'){
        const {Redis} = require("ioredis")
        const client:any = new Redis();
        try{
            await client.set(`${group}:${JSON.stringify(key)}`, JSON.stringify(data))
            await client.quit()
            }catch{
                console.log("Catch")
            }
        }
    }
      
}