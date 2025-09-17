import 'reflect-metadata';
import {
    Post, Res,JsonController
} from 'routing-controllers';
// import { CaptchaRequest } from './requests/CaptchaRequest';
import { Captcha } from '../models/Captcha';
import { getManager } from 'typeorm';
// import { CaptchaService } from '../services/CaptchaService';


@JsonController('/captcha')
export class CaptchaController {

@Post('/generate-custom-captcha')
public async createCaptcha(@Res() response: any): Promise<any> {
    
  let identifier="CAPTCHA_"+Date.now().toString();

  var charsArray = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var lengthOtp = 4;
  var captcha = [];
  for (var i = 0; i < lengthOtp; i++) {
    //below code will not allow Repetition of Characters
    var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
    if (captcha.indexOf(charsArray[index]) == -1)
      captcha.push(charsArray[index]);
    else i--;
  }

    const newCaptcha = new Captcha();
    const captchaRepo = getManager().getRepository(Captcha);
    
    newCaptcha.code = captcha.join("");
    newCaptcha.browserIdentifier = identifier;
    newCaptcha.uid = '';
    const captchaSave = await captchaRepo.save(newCaptcha);     
    const successResponse: any = {
        status: 1,
        message: 'Captcha added sucessfully.',
        data: captchaSave,
    };
    return response.status(200).send(successResponse);

}
}