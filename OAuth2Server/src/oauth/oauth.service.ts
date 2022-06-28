import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CredentialsDto, QueryDto } from './dto';
import { codes } from './utils/codecreation';
import { cookies } from './utils/loggedCookies';

var params: string

@Injectable()
export class OauthService {


  constructor( private authservice: AuthService){}

  async misc(req: Request, q: { access_token: string; }, res: Response) {
    const user = await this.authservice.cmdfetch(q.access_token)
    if(typeof user === 'string' || user instanceof String){
      return {url: "http://localhost:3001/create_cmd/?hash="+user, statusCode: 303}
    } else{
      return this.setCookiecmd(req, user ,res)
    };
  }

  setCookie(req: Request ,user: any, response:Response){
    const cookie = cookies.saveCookie(user);
    response.cookie('oauth-cookie', cookie);
    const auth_url = 'http://'+req.headers.host+'/auth'+params;  
    return {url:auth_url, statusCode: 303};
  }

  setCookiecmd(req: Request ,user: any, response:Response){
    const cookie = cookies.saveCookie(user);
    response.cookie('oauth-cookie', cookie);
    const auth_url = 'http://'+req.headers.host+'/cmd/auth'+params;  
    return {url:auth_url, statusCode: 303};
  }

  async authenticateUser(query: any, req: Request) {
    var user = await cookies.findUserByCookie(req.cookies);
    return this.authCodeGen(query,user);
  }

  async post_create_cmd(res: Request, body: {username:string, password0: string, password1:string, hash: string}, response: Response) {
    this.authservice.createCMD(body)
    var user = await this.authservice.getUser(body.username,body.password0)
    return this.setCookiecmd(res,user,response);
  }

  async post_login(res: Request, credentials: CredentialsDto, response: Response) {
    const user =  await this.authservice.validateUser(credentials.username, credentials.password);
    if(user.userId ===undefined || user.userName ===undefined){
        const redirect_url = 'http://'+res.headers.host+'/login'+params;
        return {url:redirect_url, statusCode: 303};
    } 

    return this.setCookie(res,user,response);
  }

  login(res: Request, query: QueryDto) {
    params = '?response_type='+query.response_type
    +'&client_id='+query.client_id
    +'&redirect_uri='+query.redirect_uri
    +'&scope='+query.scope
    +'&state='+query.state;
    const redirect_url = 'http://'+res.headers.host+'/login'+params;
    return { action : redirect_url};
  }

  authCodeGen(query: any, user: any) {
    var url_string = query.redirect_uri;
    const state = query.state;
    if (user) {
      var auth_code = codes.generateAuthCode(
        user,
        query.client_id,
        query.redirect_uri,
        query.scope,
      );
      url_string = url_string + '?code=' + auth_code + '&state=' + state;
      return { url: url_string, statusCode: 303 };
    }
  }

  tokenGen(body: {
    grant_type: string;
    code: string;
    redirect_uri: string;
    client_id: string;
    client_secret: string;
  }) {
    if (!codes.checkClient(body.client_id, body.client_secret)) {
      return {
        error: 'invalid_request (client secret wrtong)',
      };
    }
    return codes.generateAccessToken(body.code, body.client_id);
  }
}
