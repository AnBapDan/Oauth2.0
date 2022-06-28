
import * as crypto from 'crypto';
import * as jwt from "jsonwebtoken";
import { AUTHORIZATION_CODE } from './data';

export class codes {

    static authorization = [];

    static generateAuthCode(user: any, client_id:string, redirect_uri:string, scope:string){
        var authcode = AUTHORIZATION_CODE
        authcode.client = client_id
        authcode.redirectUri= redirect_uri
        authcode.scope=scope
        authcode.user = user
        authcode.authorizationCode =  crypto.randomBytes(16).toString('hex')
        codes.authorization.push(authcode)

        return authcode.authorizationCode
    
    }

    static deleteAuthCode(code:string){
        var a = codes.authorization.find(t => t.authorizationCode === code)
        if(a){
            codes.authorization = codes.authorization.filter(t => t.authorizationCode !== a);
            return a;
        }else{
            return false;
        }


    }

    static checkClient(client_id:string, client_secret:string){
        const clients = [{client_id:"123abc",client_secret:"projiaa2"}];

        if(clients.find(x => x.client_id === client_id && x.client_secret === client_secret)){
            return true;
        }
        return false;
    }

    static generateAccessToken(auth_code:string,  access_clientId: string){
        const params = this.deleteAuthCode(auth_code);

        if(params){
            const user = params.user;
            const client = params.client;
            const scope = params.scope;
    
            if (client !== access_clientId){
                return {
                    "error":"invalid_request(client mismatch"
                  };
            }
            return {"access_token": jwt.sign({user, client, scope},"projiaa2",{expiresIn: "2h"}), "token_type": "Bearer"};
        }else{
            return {
                "error":"invalid_request(missing authorization object)"
            };
        }

    }
}