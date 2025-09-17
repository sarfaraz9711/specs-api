/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

export function authorizationChecker(connection: Connection): (action: Action, roles: string[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, roles: any): Promise<boolean> {
        // here you can use request/response objects from action
        // also if decorator defines roles it needs to access the action
        // you can use them to provide granular access check
        // checker must return either boolean (true or false)
        // either promise that resolves a boolean value
        const userId = await authService.parseBasicAuthFromRequest(action.request);
        if (userId === undefined) {
            log.warn('No credentials given');
            return false;
        }
         // Check the token is revocked or not
         const checkRevoke = await authService.checkTokenExist(action.request);
         if (!checkRevoke) {
             log.warn('Invalid token');
             return false;
            }

        if (roles[0] === 'customer') {
            action.request.user = await authService.validateCustomer(userId.id);
            if (action.request.user === undefined) {
                log.warn('Invalid credentials given');
                return false;
            }

            log.info('Successfully checked credentials');
            return true;

        } else if (roles[0] === 'admin-vendor') {
            if (userId.role === 'admin') {
                action.request.user = await authService.validateUser(userId.id);
            }
            if (action.request.user === undefined) {
                log.warn('Invalid credentials given');
                return false;
            }
            log.info('Successfully checked credentials');
            return true;
        } else {

            // action.request.user = await authService.validateUser(userId);
            // if (action.request.user === undefined) {
            //     log.warn('Invalid credentials given');
            //     return false;
            // }

            // log.info('Successfully checked credentials');
            // return true;
            action.request.user = await authService.validateUser(userId.id);
            if (action.request.user === undefined) {
                log.warn('Invalid credentials given');
                return false;
            }
            // check for route permissions
            const routeName = roles[1];
            const userGroupId = (action.request.user && action.request.user.userGroupId) ? action.request.user.userGroupId : undefined;
            if (userGroupId) {
                const getUserGroup = await authService.validateUserGroup(userGroupId);
                if (getUserGroup) {
                    if (getUserGroup.groupId === 1) {
                        return true;
                    } else {
                        if (routeName) {
                            let permissions;
                            if (action.request.user.permission) {
                                permissions = action.request.user.permission ? JSON.parse(action.request.user.permission) : {};
                            } else {
                                permissions = getUserGroup.permission ? JSON.parse(getUserGroup.permission) : {};
                            }
                            if (permissions) {
                                if (!permissions[routeName]) {
                                    log.warn('Forbidden');
                                    return false;
                                }
                            }
                        }
                    }

                }

            } else {
                log.warn('Invalid group');
                return false;

            }
            log.info('Successfully checked credentials');
            return true;

        }
    };
}
