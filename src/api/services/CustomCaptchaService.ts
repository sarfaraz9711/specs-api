
// import { Captcha } from "../models/Captcha";
import { getManager } from 'typeorm';

export class CustomCaptchaService {

    public async verifyCustomCaptcha(captchaData:any): Promise<any>{

        
        const queryResults = await getManager().query(`SELECT COUNT(id) rowCount FROM custom_captcha WHERE BINARY code = "${captchaData.captchaToken}" AND browser_identifier = "${captchaData.browserIdentifier}" `)

        if(queryResults[0].rowCount > 0){

        console.log(captchaData, "Nero captcha data++++++++++++++++++++++++++++++++++++++")
       // const _captcha = getManager().getRepository(Captcha)
        

        if(queryResults.length > 0){
          //  await _captcha.delete({browserIdentifier:captchaData.browserIdentifier})

            return true;
        }else{
            return false;
        }
         
    }
    }
}