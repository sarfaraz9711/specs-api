/*
 * SpurtCommerce API
 * version 4.5.1
 * Copyright (c) 2021 PICCOSOFT
 * Author piccosoft <support@spurtcommerce.com>
 * Licensed under the MIT license.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

import * as pkg from '../package.json';
import {
    getOsEnv, getOsEnvOptional, getOsPath, getOsPaths, normalizePort, toBool, toNumber
} from './lib/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config(
    {
        path: path.join(process.cwd(), `.env${((!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? '' : '.' + process.env.NODE_ENV)}`),
    }
);

/**
 * Environment variables
 */
export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    app: {
        name: getOsEnv('APP_NAME'),
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnv('APP_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        banner: toBool(getOsEnv('APP_BANNER')),
        dirs: {
            migrations: getOsPaths('TYPEORM_MIGRATIONS'),
            migrationsDir: getOsPath('TYPEORM_MIGRATIONS_DIR'),
            entities: getOsPaths('TYPEORM_ENTITIES'),
            entitiesDir: getOsPath('TYPEORM_ENTITIES_DIR'),
            controllers: getOsPaths('CONTROLLERS'),
            middlewares: getOsPaths('MIDDLEWARES'),
            interceptors: getOsPaths('INTERCEPTORS'),
            subscribers: getOsPaths('SUBSCRIBERS'),
            resolvers: getOsPaths('RESOLVERS'),
        },
    },
    log: {
        level: getOsEnv('LOG_LEVEL'),
        json: toBool(getOsEnvOptional('LOG_JSON')),
        output: getOsEnv('LOG_OUTPUT'),
    },
    db: {
        type: getOsEnv('TYPEORM_CONNECTION'),
        host: getOsEnvOptional('TYPEORM_HOST'),
        port: toNumber(getOsEnvOptional('TYPEORM_PORT')),
        username: getOsEnvOptional('TYPEORM_USERNAME'),
        password: getOsEnvOptional('TYPEORM_PASSWORD'),
        database: getOsEnv('TYPEORM_DATABASE'),
        synchronize: toBool(getOsEnvOptional('TYPEORM_SYNCHRONIZE')),
        logging: toBool(getOsEnv('TYPEORM_LOGGING')),
    },
    apidoc: {
        enabled: toBool(getOsEnv('APIDOC_ENABLED')),
        route: getOsEnv('APIDOC_ROUTE'),
    },
    monitor: {
        enabled: toBool(getOsEnv('MONITOR_ENABLED')),
        route: getOsEnv('MONITOR_ROUTE'),
        username: getOsEnv('MONITOR_USERNAME'),
        password: getOsEnv('MONITOR_PASSWORD'),
    },
    imageserver: getOsEnv('IMAGE_SERVER'),
    storeUrl: getOsEnv('STORE_URL'),
    thankuPageUrl: getOsEnv('THANKYOU_PAGE_URL'),
    cancelUrl: getOsEnv('CANCEL_URL'),
    baseUrl: getOsEnv('BASE_URL'),
    storeRedirectUrl: getOsEnv('STORE_REDIRECT_URL'),
    cdnUrl: getOsEnv('CDN_LINK'),
    adminRedirectUrl: getOsEnv('ADMIN_REDIRECT_URL'),
    storeForgetPasswordLink: getOsEnv('STORE_FORGET_PASSWORD_URL'),
    imageUrl: getOsEnv('IMAGE_URL'),
    loginAttemptsCount: getOsEnv('LOGIN_ATTEPMTS_COUNT'),
    loginAttemptsMinutes: getOsEnv('LOGIN_ATTEPMTS_MINUTES'),
    jwtSecret: getOsEnv('JWT_SECRET'),
    cryptoSecret: getOsEnv('CRYPTO_SECRET'),
    availImageTypes: getOsEnv('AVAILABLE_IMAGE_TYPES'),
    availAllowTypes: getOsEnv('AVAILABLE_ALLOW_TYPES'),
    payment: {
        PINELABS_PAYMENT_PASSWORD: getOsEnv('PINELABS_PAYMENT_PASSWORD'),
        PINELABS_PAYMENT_EMAIL: getOsEnv('PINELABS_PAYMENT_EMAIL'),
        PINELAB_DOUBLE_VERIFICATION:getOsEnv('PINELAB_DOUBLE_VERIFICATION'),
        pineLabReturnUrl: getOsEnv('PINELAB_RETURN_URL'),
        pineLabPaymentUrl: getOsEnv('PINELAB_PAYMENT_URL'),
        paytmPaytmentUrl: getOsEnv('PAYTM_PAYMENT_URL'),
        paytmReturnUrl: getOsEnv('PAYTM_RETURN_URL'),
        paytmMerchantKey: getOsEnv('PAYTM_MERCHANT_KEY')
    },
    ingenicoPayment: {
        dualVerificationUrl: getOsEnv('INGENICO_DOUBLE_VERIFICATION_URL'),
    },
    uniComm: {
        userName: getOsEnv('UNICOM_USER_NAME'),
        password: getOsEnv('UNICOM_PASS'),
        apiUrl: getOsEnv('UNICOM_API_URL'),
        facilityCode: getOsEnv('UNICOM_DUMMY_FACILITY'),
        facilityCode2: getOsEnv('UNICOM_DUMMY_FACILITY2'),
        testMode: getOsEnv('UNICOM_TEST_MODE'),
        inventoryDeltaDuration: getOsEnv('UNICOM_INVENTORY_DELTA_DURATION'),
        channel: getOsEnv("UNICOM_CHANNEL")
    },
    otpSMS:{
        otpTestMode: getOsEnv('OTP_TEST_MODE'), 
    },
    checkoutUrl: getOsEnv('CHECKOUT_PAGE'),
    procedureTimeDuration :  (parseInt(getOsEnv('UNICOM_INVENTORY_DELTA_DURATION')) + 10),
    OTP_TIME_LIMIT_IN_SECONDS: getOsEnv('OTP_TIME_LIMIT_IN_SECONDS'),
    whatsApp:{
        senderNumber: getOsEnv('SENDER_NUMBER'),
        authKey:  getOsEnv('AUTH_KEY'),
        orderConf:  getOsEnv('ORDER_CONF'),
        orderShip:  getOsEnv('ORDER_SHIP'),
        orderOfd:  getOsEnv('ORDER_OFD'),
        orderDelay:  getOsEnv('ORDER_DELAY'),
        orderDelivered:  getOsEnv('ORDER_DELIVERED'), 
        orderReturn:  getOsEnv('ORDER_RETURN'),
        orderImagesLink:  getOsEnv('ORDER_IMAGE_LINK'),
        orderConfImg:  getOsEnv('ORDER_CONF_IMG'),
        orderShipImg:  getOsEnv('ORDER_SHIP_IMG'),
        orderOfdImg:  getOsEnv('ORDER_OFD_IMG'),
        orderDelayImg:  getOsEnv('ORDER_DELAY_IMG'),
        orderDeliveredImg:  getOsEnv('ORDER_DELIVERED_IMG'),
        orderReturnImg:  getOsEnv('ORDER_RETURN_IMG'),
        receiverNo: getOsEnv('RECEIVER_NO'),
        devMode:  getOsEnv('DEV_MODE')
        
    },
    sms:{
        receiverNo: getOsEnv('SMS_RECEIVER_NO'),
        devMode:  getOsEnv('SMS_DEV_MODE'),
        smsUrl:   getOsEnv('SMS_URL'),
        smsApiUid:getOsEnv('SMS_APIUID'),
        smsPassword: getOsEnv('SMS_PASSWORD'),
        newSmsUrl1: getOsEnv('NEW_SMS_URL_1'),
        newSmsUrl2: getOsEnv('NEW_SMS_URL_2')
        
    },
    appLogFile: getOsEnv("APP_LOG_FILE"),
    redis: getOsEnv("REDIS")
};

export const mail = {
    SERVICE: getOsEnv('MAIL_DRIVER'),
    HOST: getOsEnv('MAIL_HOST'),
    PORT: getOsEnv('MAIL_PORT'),
    SECURE: getOsEnv('MAIL_SECURE'),
    FROM: getOsEnv('MAIL_FROM'),
    DEV:getOsEnv('MAIL_DEV_MOD'),
    IMAGE_LINK: getOsEnv('LOGO_URL'),
    TEMP_ID:getOsEnv('MAIL_TEMP_ID'),
    AUTH: {
        user: getOsEnv('MAIL_USERNAME'),
        pass: getOsEnv('MAIL_PASSWORD'),
    },
};

// AWS S3 Access Key
export const aws_setup = {
    AWS_ACCESS_KEY_ID: getOsEnv('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: getOsEnv('AWS_SECRET_ACCESS_KEY'),
    AWS_DEFAULT_REGION: getOsEnv('AWS_DEFAULT_REGION'),
    AWS_BUCKET: getOsEnv('AWS_BUCKET'),
};

export const discount = {
    discountUrl: getOsEnv('DISCOUNT_URL')
}

export const delivery_ecom = {

    DELHIVERY_URL : getOsEnv('DEL_URL'),
    DEL_CLIENT_NAME : getOsEnv("DEL_CLIENT_NAME"),
    DEL_PICKUP_WAREHOUSE : getOsEnv("DEL_PICKUP_WAREHOUSE"),
    DEL_API_TOKEN: getOsEnv("DEL_API_TOKEN"),
    ECOM_URL: getOsEnv("ECOM_URL"),
    ECOM_USERNAME: getOsEnv("ECOM_USERNAME"),
    ECOM_PASSWORD: getOsEnv("ECOM_PASSWORD"),
    delAwbTrackUrl:getOsEnv("DEL_AWB_TRACK"),
    delToken: getOsEnv("DEL_TOKEN")

};
export const prozo = {

    PROZO_URL : getOsEnv('PROZOURL'),
        PROZO_USERNAMR : getOsEnv("PROZOUSERNAME"),
        PROZO_PASSWORD : getOsEnv("PROZOPASSWORD"),    
};
