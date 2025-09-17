import { AuditLog } from '../models/AuditLog';
import { Container } from 'typedi';
import { AuditLogService } from '../services/AuditLogService';
import * as path from 'path';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import moment from 'moment';
import { LessThan } from 'typeorm';
const auditLogService = Container.get<AuditLogService>(AuditLogService);
@Middleware({ type: 'after' })

export class LoggingMiddleware implements ExpressMiddlewareInterface {
  public async use(request: any, response: any, next: any): Promise<void> {
    if(false){
    const fs = require("fs");
    var logger = fs.createWriteStream('logs/ipTrackerWithApi.txt', {
       flags: 'a' // 'a' means appending (old data will be preserved)
    })
    var writeLine = (line) => logger.write(`\n${line}`);
      const currentDate = new Date();
      let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
      writeLine(`IP: ${require('request-ip').getClientIp(request)} with API ${request.url} on [${timeString}]`);
  }
    if (request && (request.user || request.method=='POST' || request.method=='PUT')) {
      const requestIp = require('request-ip');
      // const browserInfo = require('browser-detect');
      // const action = /[^/]*$/.exec(request.url)[0];
      const actionJson = path.join(process.cwd(), 'uploads' + '/' + 'admin_actions.json');
      const actionData = require(actionJson);
      const withoutRouteArray = ['add-category', 'update-category', 'delete-category', 'categorylist', 'category-list-intree'
        , 'update-category-slug', 'category-count', 'category-detail'];
      const routeSplit = request.url.split('/');
      const findParamApi = routeSplit.indexOf('api') ? routeSplit.indexOf('api') : 1;
      const moduleName = routeSplit[findParamApi + 1];
      const routeTwo = (routeSplit && routeSplit[2]) ? (routeSplit[2].includes('?') ? routeSplit[2].substr(0, routeSplit[2].indexOf('?')) : routeSplit[2]) : '';
      const routeThree = (routeSplit && routeSplit[3]) ? (routeSplit[3].includes('?') ? routeSplit[3].substr(0, routeSplit[3].indexOf('?')) : routeSplit[3]) : '';
      const isRoute = (routeSplit && routeSplit[2] && !withoutRouteArray[2].includes(routeSplit[2])) ? true : false;
      const filterByFunc = function filterBy(list: any, criteria: any): any {
        return list.filter(candidate =>
          Object.keys(criteria).every(key =>
            candidate[key] === criteria[key]
          )
        );
      };
      const val = await actionData.actions[actionData.actions.map((item: any): any => {
        return item.action;
      }).indexOf(routeTwo)];
      const actionValue = isRoute ? filterByFunc(actionData.actions, { action: routeThree, route: routeTwo }) : val;
      const keyObject = isRoute ? actionValue[0] : actionValue;
      if (true || keyObject) {
        // get excpet first 30 days data
        if(false){
        const auditMonth = moment().subtract(1, 'months').format('YYYY-MM-DD');
        const exceptOneMonthRcrd = await auditLogService.find({
          where: {
            createdDate: LessThan(auditMonth),
          },
        });
        if (exceptOneMonthRcrd.length) {
          await auditLogService.delete(exceptOneMonthRcrd);
        }
      }
        const auditLog = new AuditLog();
        auditLog.userId = request.user?(request.user.userId?request.user.userId:request.user.id):null;
        auditLog.logType = 'response';
        auditLog.requestUrl = request.url;
        const source = request.headers['user-agent'];
        const ua = source;
        auditLog.browserInfo = JSON.stringify({ ip: requestIp.getClientIp(request), browser: ua });
        const name:any=request.user?request.user.firstName:null
        switch (request.method) {
          case 'POST':
            auditLog.description = keyObject && keyObject.value?keyObject.value:'Request' + ' has been created by ' + name;
            break;
          case 'GET':
            auditLog.description = keyObject && keyObject.value?keyObject.value:'Request' + ' has been read by ' + name;
            break;
          case 'PUT':
            auditLog.description = keyObject && keyObject.value?keyObject.value:'Request' + ' has been updated by ' + name;
            break;
          case 'DELETE':
            auditLog.description = keyObject && keyObject.value?keyObject.value:'Request' + ' has been deleted by ' + name;
            break;
          default:
            auditLog.description = undefined;

        }
        auditLog.params = JSON.stringify(request.body);
        auditLog.method = request.method;
        auditLog.userName = name;
        auditLog.module = moduleName;
        await auditLogService.createOrUpdate(auditLog);

      }
    }
    next();
  }
}
