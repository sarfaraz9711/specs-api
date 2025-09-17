import { env } from '../../env';
import {Customer} from '../models/Customer';
import {AccessToken} from '../models/AccessTokenModel';
import {User} from '../models/User';
// import moment from 'moment';
import { getManager } from 'typeorm';
export function CheckTokenMiddleware(request: any, response: any, next: any): any {
    // const customerRepository = getManager().getRepository(Customer);
    // const accessTokenRepository = getManager().getRepository(AccessToken);
    const jwt = require('jsonwebtoken');
    const authorization = request.header('authorization');
    const { CommonService : cs } = require('../common/commonService');
    let _m = new cs();
    if (authorization) {
        const encryptString = authorization.split(' ')[1];
        const Crypto  = require('crypto-js');
        const bytes  = Crypto.AES.decrypt(encryptString, env.cryptoSecret);
        const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
        jwt.verify(originalEncryptedString, env.jwtSecret, async (err: any, decoded: any) => {
            try{
            const redisData = await _m.getRedisData('CheckTokenMiddleware', authorization)
                if(redisData){
                    request.id = redisData;
                    next();
                }else{
                    if (err) {
                        request.id = '';
                        next();
                    } else {
                        request.id = decoded.id;
                        next();
                        // const checkTokenRevoke: any = await accessTokenRepository.findOne({
                        //     where: {
                        //         token: originalEncryptedString,
                        //     },
                        // });
                        // if (checkTokenRevoke) {
                        //     const customerDetails = await customerRepository.findOne({where: {id : decoded.id, deleteFlag: 0, isActive: 1}});
                        //     if (customerDetails) {
                        //         try{
                        //             await _m.setRedisData(authorization,'CheckTokenMiddleware',customerDetails.id)
                        //         }catch{
                        //         }
                        //         request.id = customerDetails.id;
                        //         next();
                        //     } else {
                        //         return response.status(401).send({status: 0, message: 'UnAuthorized user'});
                        //     }
                        // } else {
                        //     request.id = '';
                        //     next();
                        // }
                    }
                }
        }catch{
            console.log("Catch")
        }
        });
    } else {
        request.id = '';
        next();
    }
}
export function CheckCustomerMiddleware(request: any, response: any, next?: (err?: any) => any): any {
    const jwt = require('jsonwebtoken');
    const authorization = request.header('authorization');
    const { CommonService : cs } = require('../common/commonService');
    let _m = new cs();

    const customerRepository = getManager().getRepository(Customer);
    // const accessTokenRepository = getManager().getRepository(AccessToken);
    if (authorization) {
        const encryptString = authorization.split(' ')[1];
        const Crypto  = require('crypto-js');
        const bytes  = Crypto.AES.decrypt(encryptString, env.cryptoSecret);
        const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
        jwt.verify(originalEncryptedString, env.jwtSecret, async (err: any, decoded: any) => {
            try{
                const redisData = await _m.getRedisData('CheckCustomerMiddleware', authorization)
                if(redisData){
                    request.user = redisData;
                    next();
                }else{
                    if (err) {
                        return response.status(401).send({status: 0, message: 'Please send a valid token'});
                    } else {
                        // const checkTokenRevoke: any = await accessTokenRepository.findOne({
                        //     where: {
                        //         token: originalEncryptedString,
                        //     },
                        // });
                            const customerDetails = await customerRepository.findOne({where: {id : decoded.id, deleteFlag: 0, isActive: 1}});
                            if (customerDetails) {
                                try{
                                    await _m.setRedisData(authorization,'CheckCustomerMiddleware',customerDetails)
                                }catch{
                                    console.log("Set Redis Catch")
                                }
                                request.user = customerDetails;
                                next();
                            } else {
                                return response.status(401).send({status: 0, message: 'UnAuthorized user'});
                            }
                    }
                }
        }catch{
            console.log("Catch")
        }
        });
    } else {
        return response.status(401).send({status: 0, message: 'UnAuthorized user'});
    }
}




export function CheckCommonMiddleware(request: any, response: any, next?: (err?: any) => any): any {
    const jwt = require('jsonwebtoken');
    const authorization = request.header('authorization');
    const customerRepository = getManager().getRepository(Customer);
    const accessTokenRepository = getManager().getRepository(AccessToken);
    const userRepository = getManager().getRepository(User);
    if (authorization) {
        const encryptString = authorization.split(' ')[1];
        const Crypto  = require('crypto-js');
        const bytes  = Crypto.AES.decrypt(encryptString, env.cryptoSecret);
        const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
        jwt.verify(originalEncryptedString, env.jwtSecret, async (err: any, decoded: any) => {
            if (err) {
                return response.status(401).send({status: 0, message: 'Please send a valid token'});
            } else {
                const checkTokenRevoke: any = await accessTokenRepository.findOne({
                    where: {
                        token: originalEncryptedString,
                    },
                });
                if (checkTokenRevoke) {


                    if(decoded && decoded.role && decoded.role == "admin"){
                        const userDetails = await userRepository.findOne({where: {userId : decoded.id, deleteFlag: 0, isActive: 1}});
                        if (userDetails) {
                            request.user = userDetails;
                            next();
                        } else {
                            return response.status(401).send({status: 0, message: 'UnAuthorized user'});
                        }

                    }else{
                    const customerDetails = await customerRepository.findOne({where: {id : decoded.id, deleteFlag: 0, isActive: 1}});
                    if (customerDetails) {
                        request.user = customerDetails;
                        next();
                    } else {
                        return response.status(401).send({status: 0, message: 'UnAuthorized user'});
                    }
                }


                } else {
                    return response.status(401).send({status: 0, message: 'UnAuthorized user'});
                }
            }
        });
    } else {
        return response.status(401).send({status: 0, message: 'UnAuthorized user'});
    }   
}