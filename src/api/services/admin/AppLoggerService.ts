
import * as AWS from 'aws-sdk';
import {env, aws_setup} from '../../../env';
const { createLogger, Transport, format } = require('winston');
//const AWS:any = require('aws-sdk');

// Configure AWS SDK with your credentials and region
AWS.config.update({
    accessKeyId: aws_setup.AWS_ACCESS_KEY_ID,
    secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY,
    region: aws_setup.AWS_DEFAULT_REGION
})

// Create an S3 instance
const s3 = new AWS.S3();

class S3Transport extends Transport {
    constructor(options) {
        super(options);
        this.bucketName = options.bucketName;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(currentDate.getDate()).padStart(2, '0');
        this.formattedDate = `${day}-${month}-${year}`;
        this.key = `customLogs/${env.appLogFile}_${this.formattedDate}.log`;
    }

    log(info:any, callback:any) {

        const { metadata } = info;
        this.key = metadata.fileName?`customLogs/${metadata.fileName}_${this.formattedDate}.log`:this.key;
        const logData = `${JSON.stringify(info)}\n`; // Convert log data to JSON and append newline

        // Retrieve existing content of the file
        s3.getObject({ Bucket: this.bucketName, Key: this.key }, (err, data) => {
            if (err && err.code !== 'NoSuchKey') {
                callback(err);
            } else {
                let existingLogs = '';
                if (data && data.Body) {
                    existingLogs = data.Body.toString();
                }

                // Append new log data to existing content
                const updatedLogs = existingLogs + logData;

                // Upload updated content back to S3
                const uploadParams = {
                    Bucket: this.bucketName,
                    Key: this.key,
                    Body: updatedLogs
                };

                s3.upload(uploadParams, (err, data) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, true);
                    }
                });
            }
        });
    }
}

const customFormat = format.printf(({ level, message, timestamp, fileName }) => {
    return `${timestamp} [${level.toUpperCase()}] ${fileName} : ${message}`; // Customize the format as desired
});

const customTimestamp = format((info:any, opts:any) => {
    const currentDate = new Date();
    let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes()+ ":" + currentDate.getSeconds();
  
    info.timestamp = timeString;

    return info;
});
// Create a Winston logger instance with the custom S3 transport
const appLogger = createLogger({
    format: format.combine(
        customTimestamp(),
        format.metadata(), // Enable metadata support
        customFormat // Use the custom format function
    ),
    transports: [
        new S3Transport({
            bucketName: aws_setup.AWS_BUCKET
           // key: 'customLogs/rnr.log' // Specify the key (path) to the log file in the bucket
        })
    ]
});

module.exports = appLogger;
