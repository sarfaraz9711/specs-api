import { Service } from 'typedi';
import { EmailService } from "./emailService";
@Service()
export class OtpTemplateService {
    constructor(private emailService: EmailService
        ) {
}
    
    public _templateMail = (tmpId: any) =>{
        let tempM = "";
        switch (tmpId) {
            case '1234':
                tempM = "<p>Hi</p>,<p>Hi this is Otp validation, your otp is : 1234</p>";
                break;
            case '2345':
                tempM = "<p>Hi</p>,<p>Hi this is Otp validation, your otp is : 2345</p>";
                break;
            default:
                tempM = "<p>Hi</p>,<p>Hi this is Otp validation, your otp is : 1234</p>";
                break;
        }
        return tempM;
    }


    public _templateMessage = (tmpId: any,objData : any = {})=> {
        let tempM = "";
        switch (tmpId) {
            case 'Order Confirmation Templates':
                tempM = "Hi Priyanka, thank you for shopping at Redchief! Your order no. "+objData["orderNO"]+" has been received. We are processing your order now, and we’ll text you when your order has shipped.";
                break;
            case 'Order Shipment Templates':
                tempM = "Hi Priya, Your order from Redchief has shipped via Delhivery(AWB). Track your order:"+objData["url"];
                break;
            case 'Order Out for Delivery':
                tempM = "Hey Priya, great news: Your order from Redchiefis out for delivery today!";
                break;
            case 'Order delivery status — delayed':
                tempM = "Hi Priyanka, your order is on its way but expect delays. Your new estimated delivery date is "+objData["deliveryDate"]+". Contact us at "+objData["contactUs"]+" if you have any questions.";
                break;
            case 'Order Delivered Templates':
                tempM = "Hi your Priya, we’re here! Your order from Redchief has been delivered. Let us know how you like product & Give your valuable Feedback here (LINK FEEDBACK)";
                break;
            case 'Return Started Templates':
                tempM = "Hi Priya, we’re sorry that you’re unsatisfied with your order from Redchief. We have started the return process for order no. "+objData["orderNO"]+". For instructions on sending us your return, click here: "+objData["returnUrl"]+"";
                break;
            case 'Return pickup confirmation template':
                tempM = "Hi Priya, You can now prepare your return package and wait for the courier to pick it up";
                break;
            case 'RETURN ORDER ACCEPTED TEMPLATE':
                tempM = "Hey Priya, We have accepted the return of your order number "+objData["orderNO"]+".and after Quality check we will be processed for the next step.<p>The package contained the following items:<br />Product 1: [product name]<br />Price:<br />Quantity: X<br />Product Code: [code]<br />Product 2: [product name]<br />Price:<br />Quantity: X<br />Product Code: [code]<br />Product 3: [product name]<br />Price:Quantity: X<br />Product Code: [code]</p>";
                break;
            case 'Returns confirmation SMS':
                tempM = "Hi Priya, we’re happy to inform you,that your order (order number ) has passed Quality check and will be processing your refund shortly. You can expect a refund to be issued to your bank account within "+objData["refundDate"]+" working days.";
                break;
            default:
                tempM = "Hey Priya, great news: Your order from Redchiefis out for delivery today!";
                break;
        }
        return tempM;
    }


    public _templateEmailMessage(tmpId:any,orderData:any):object{
        let emailmessage={
            subject:"",
            body:""
        };
        switch(tmpId){
            case '1234' : 
            emailmessage.subject = "Order Created successfully [Red Chief]";
            emailmessage.body = "Dear "+orderData.shippingFirstname+", Order Created successfully.Order Id: "+orderData.orderPrefixId+" Order Amount: "+orderData.amount+" Rs";
                break;
            case '2345' :
                emailmessage.subject = "Order Created successfully";
                emailmessage.body = "Dear "+orderData.shippingFirstname+", Order Created successfully";
                break;
            default : 
            emailmessage.subject = "Order Created successfully";
            emailmessage.body = "Dear "+orderData.shippingFirstname+", Order Created successfully";
                break; 
        }
        return emailmessage;
    }

    public _emailService=(orderData:any,tempId:any)=> {
       let message=this._templateEmailMessage(tempId,orderData);
       this.emailService.sendEmail(orderData.email ,message);
    }
 



    public async sendMessage(_tempId: any, _mobileNo: any, rawData:any = {}): Promise<any> {
     
    }

}