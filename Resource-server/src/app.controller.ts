import { Body, Controller, Post, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { Request as OtherReq} from 'express';
import { HttpService } from '@nestjs/axios';

@Controller()
export class AppController {
  constructor(private appService: AppService, private readonly httpService: HttpService) {}

  @Post('/')
  information(@Request() req: OtherReq, @Body() body: {nbins: string}){
    if(!this.appService.VerifyJwt(req.headers.authorization.split(" ")[1])){ return {"error": "invalid token"} }
    return this.appService.RetrieveData(req.headers.authorization.split(" ")[1],Number(body.nbins));
  }

  @Post('/update')
  update(@Request() req: OtherReq, @Body() body: {result: string}){
    if(!this.appService.VerifyJwt(req.headers.authorization.split(" ")[1])){ return {"error": "invalid token"} }
    this.appService.UpdateData(req.headers.authorization.split(" ")[1],Number(body.result))
    return {'message':'updated'}
  }
}
