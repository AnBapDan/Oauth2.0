import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { cookies } from 'src/oauth/utils/loggedCookies';

@Injectable()
export class CookiesMiddleware implements NestMiddleware {
  use(req: Request, res: Response,next: NextFunction) {
    var query = req.query
    const params = '?response_type='+query.response_type
    +'&client_id='+query.client_id
    +'&redirect_uri='+query.redirect_uri
    +'&scope='+query.scope
    +'&state='+query.state;
    const redirect_url = 'http://'+req.headers.host+'/login'+params;

    if(!req.cookies){

        return res.redirect(303,redirect_url);

    }

    if(!cookies.findUserByCookie(req.cookies)){
  
        return res.redirect(303, redirect_url);
      
    }
    next();
  }
}
