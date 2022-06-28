import { Body, Controller, Post, Query, Redirect, Get, Render, Request, Res, Req} from '@nestjs/common';
import { Request as OtherReq} from 'express';
import { AuthService } from 'src/auth/auth.service';
import { OauthService } from './oauth.service';
import { CredentialsDto, QueryDto, TokenDto } from './dto';

import { Response as EResponse } from 'express';
import { tokens } from './utils/tokens';
import { codes } from './utils/codecreation';
@Controller()
export class OauthController {

    constructor(private oauthservice: OauthService, private authservice: AuthService){}
    base_url = 'http://localhost:3001';

    @Get('/login')
    @Render('login')
    async login(@Request() res: OtherReq, @Query() query: QueryDto){
        return this.oauthservice.login(res, query);
    }

    @Post('/login')
    @Redirect('/error',404)
    async checklogin(@Request() res: OtherReq, @Body() credentials: CredentialsDto, @Res({ passthrough: true }) response: EResponse){
        return this.oauthservice.post_login(res, credentials, response)
    }

    @Get('/auth')
    @Render('authorization')
    @Redirect('/login', 303)
    async auth(@Req() req: OtherReq){
        return { action : 'http://'+req.headers.host+req.originalUrl};
    }


    @Get('/cmd/auth')
    @Render('authorizationcmd')
    @Redirect('/login', 303)
    async authcmd(@Req() req: OtherReq){
        return { action : 'http://'+req.headers.host+req.originalUrl.replace("/cmd",""), query: 'http://localhost:3001/changepasswd'+req.originalUrl.replace("/cmd/auth","")};
    }

    @Get("/changepasswd")
    @Render("password")
    async pass(@Req() req: OtherReq){
      return  { action : 'http://'+req.headers.host+req.originalUrl};
    }


    @Post("/changepasswd")
    @Redirect('/cmd/auth', 303)
    async passwd(@Request() req: OtherReq, @Body() body, @Res({ passthrough: true }) response: EResponse){
      this.authservice.changepass( body.password0, req.cookies)
      
      return {url:'http://localhost:3001/cmd/auth'+req.originalUrl.replace("/changepasswd",""), statusCode: 303}
      
    }

    @Post('/auth')
    @Redirect('/login', 303)
    async authenticateUser(@Query() query: any, @Request() req: OtherReq){
        return this.oauthservice.authenticateUser(query, req);

    }

    @Post('/token')
    token(@Body() body: TokenDto){
        var token = this.oauthservice.tokenGen(body)
        tokens.saveToken(token)
        return token;
    }

    @Post('/revoke')
    revoke(@Body() body: {client_id:string, client_secret:string, token: any}){
        if(!codes.checkClient(body.client_id,body.client_secret)){
            return null
        }
        return tokens.revokeToken(body.token)
    }

    @Get('/findToken')
    find(@Body() body: {token: any}){
        return tokens.findToken(body.token)
    }

    
  @Post("/login/cmd")
  cmd(@Res() res){
    return res.redirect("https://preprod.autenticacao.gov.pt/oauth/askauthorization?redirect_uri=http://127.0.0.1:3001/Authorized&client_id=XXXXXX&scope=http://interop.gov.pt/MDC/Cidadao/NIC&response_type=token")
  }

  //Needed to retrieve information from the browser to the OauthServer
  @Get("/Authorized")
  @Render("middleware")
  authorized_cmd(){}

  @Get("/Authorized/parsed")
  @Redirect('/create_cmd',303)
  async misc(@Request() req: OtherReq, @Query() q: {access_token: string}, @Res({ passthrough: true }) response: EResponse){
    return this.oauthservice.misc(req, q, response)
    
  }

  @Get("/create_cmd")
  @Render("create")
  createCMD(@Request() req: OtherReq, @Query() query: {hash: string}, @Res({ passthrough: true }) response: EResponse){

    return {action:"http://localhost:3001/create_cmd",hash:query.hash}
  }

  @Post("/create_cmd")
  @Redirect("/error",404)
  cmdAccount(@Request() req: OtherReq, @Body() body: {username:string, password0: string, password1:string, hash: string}, @Res({ passthrough: true }) response: EResponse){
    return this.oauthservice.post_create_cmd(req, body, response)
  }

}
