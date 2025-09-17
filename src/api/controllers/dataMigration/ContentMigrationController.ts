import { Body, JsonController, Post, Res, UploadedFile } from "routing-controllers";
import { CommonService } from "../../common/commonService";
import moment = require('moment/moment');
import { Page } from "../../models/Page";
import { PageService } from "../../services/PageService";
import { PageGroupService } from "../../services/PageGroupService";
import { MigrationService } from "../../common/MigrationService";

@JsonController('/data-migration/cms')
export class LoginOtpController {
     constructor(
          private _m: CommonService,
          private pageService: PageService,
          private pageGroupService: PageGroupService,
          private _migration : MigrationService

     ) { }
    


     // Import Content
     /**
      * @api {post} /api/data-migration/cms/secure/import-content Import Content
      * @apiGroup Data Migration
      * @apiParam (Request body) {File} file File
      * @apiSuccessExample {json} Success
      * HTTP/1.1 200 OK
      * {
      *      "message": "Successfully saved XLS data",
      *      "status": "200"
      *      "data" : "{
      *           "Inserted" : "23 rows of 57",
      *           "failed" : "24 rows of 57",
      *           "failed_record_path" : "https:amazon/filename.xls"
      *        }"
      * }
      * @apiSampleRequest /api/data-migration/secure/import-content
      * @apiErrorExample {json} GenerateError error
      * HTTP/1.1 500 Internal Server Error
      */
     @Post('/secure/import-content')
     public async importUserData(@UploadedFile('file') files: any, @Res() res: any, @Body() rawData: any,@Res() response: any): Promise<any> {
          const csv = require("csvtojson");
          let b = files.originalname;

          if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
               let _j = await csv().fromString((files.buffer).toString());
               if (_j.length > 0) {
                    let _executionOver = await this._doRegister(_j);
                    let filePath = "";
                    if(_executionOver.failedRecord.length > 0){
                         filePath = await this._migration._doCreateCSVOnS3(_executionOver.failedRecord,files.originalname,'page');
                    }else{
                         filePath = "NA";
                    }
                    
                    
                    if(filePath){
                         let _json = {
                              "success": _executionOver.successRecord.length,
                              "failed": _executionOver.failedRecord.length,
                              "downloadFailedRecords": filePath
                         };
                         return res.status(200).send(await this._m.getMessage('200', _json)).end();
                    }
               }
          } else {
               return res.status(200).send(await this._m.getMessage('500', '', 'Invalid file.')).end();
          }
                  
     }

    public async _doRegister(_j: any): Promise<any> {
          let failedJson = [];
          let successJson = [];
          let counter = 0;
          let cloneArray = JSON.parse(JSON.stringify(_j));

          for (let inc = 0; inc < _j.length; inc++) {
               
               counter += 1;


               if(_j[inc].Title == "" && _j[inc].Content == ""){
                    continue;
               }
        
          let pageGroupId = await this.pageGroupService.findOne({ where: { groupName: _j[inc].PageGroup } });
          if (_j[inc].Title === "") {
               Object.assign(cloneArray[inc], { 'message': 'Title should not be empty' });
               failedJson.push(cloneArray[inc]);

               continue;
          }
          if (_j[inc].Content === "") {
               Object.assign(cloneArray[inc], { 'message': 'Content should not be empty' });
               failedJson.push(cloneArray[inc]);

               continue;
          }
              if(_j[inc].Title != "" && _j[inc].Content != ""){
               var page = new Page();
               page.title = _j[inc].Title;
               page.content = _j[inc].Content;
               page.isActive = _j[inc].Status;
               page.pageGroupId = pageGroupId;
               page.metaTagTitle = _j[inc].TagTitle;
               page.metaTagContent = _j[inc].TagContent;
               page.metaTagKeyword = _j[inc].TagKeyword;
               page.oldContentId = _j[inc]['Content Id'];
               page.oldContentCreationDate = moment(new Date(_j[inc].ContentCreationdate)).format('YYYY-MM-DD HH:mm:ss');
               var pageSave = await this.pageService.create(page);
              }
               if (pageSave) {

                    successJson.push(_j[inc]);
               }else{
                    successJson=[];
               }

          }
          if (counter == ((_j.length))) {
               let _newJ = {
                    "totalRecord": _j.length,
                    "failedRecord": failedJson,
                    "successRecord": successJson
               };
               return Promise.resolve(_newJ);
          }


     }
          
     }
