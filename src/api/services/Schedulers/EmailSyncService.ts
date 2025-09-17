/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
//import { OrmRepository } from 'typeorm-typedi-extensions';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
//import { Enquiry } from '../models/Enquiry';
import { EmailModels } from '../../models/Schedulers/EmailModel';
import { getManager } from 'typeorm';

//import { EmailSyncRepository } from '../../repositories/Schedulers/EmailSyncRepository';
//import {Like} from 'typeorm';

@Service()
export class EmailSyncService {
    // create email service
    public async create(newEmail: any): Promise<any> {
        //const newEmailResponse = await this.emailSyncRepository.save(newEmail);
        const newEmailResponse = getManager().getRepository(EmailModels);

       var emailsave= await newEmailResponse.save(newEmail);

        return emailsave;
    } 

    public async syncAllEmail(): Promise<any> {
        const EmailRepository = getManager().getRepository(EmailModels);
        const emailData = await EmailRepository.find({
            where: {
                status: "Not_send",
            },
         });
        return emailData;
    }
    public async updateEmail(id:any): Promise<any> {
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const EmailRepository = getManager().getRepository(EmailModels);
        await EmailRepository.createQueryBuilder()
        .update()
        .set({ status: "success",sendOn:date})
        .where("id = :id", { id: id })
        .execute()
    }

}
