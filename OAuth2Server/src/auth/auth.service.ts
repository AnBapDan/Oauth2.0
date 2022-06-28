import { users } from 'src/oauth/utils/users';
import fetch from 'node-fetch';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { cookies } from 'src/oauth/utils/loggedCookies';
import { Request, Response } from 'express'
@Injectable()
export class AuthService {

  user_array = users

  createCMD(body: {username:string, password0: string, password1:string, hash: string}) {
    const id = this.user_array.length
    var pos = this.user_array.push({id, username:body.username, password: body.password0, CC: body.hash})
  }

  async changepass(newpassword:string, cookie){
    const usercookie = cookies.findUserByCookies(cookie['oauth-cookie'])

    var user = this.user_array.find((u) => u.username === usercookie.userName )
    user.password = newpassword

  }
  async validateUser(username: string, password: string) {
    var user ={... this.user_array.find(
      (u) => u.username === username && u.password === password,
    )};
    if (user === undefined) {
      return null;
    }
    if (user) {
      delete user.password;
      return {
        userId: user.id,
        userName: user.username,
      };
    }
    return null;
  }

  async getUser(username: string, password: string){
    var user ={... this.user_array.find(
      (u) => u.username === username && u.password === password,
    )};

    delete user.password;
    return {
      userId: user.id,
      userName: user.username,
    };
  }
  //devolve um user via CMD
  async cmdfetch(access_token: string) {
    //token do CMD
    var body = {
      token: access_token,
      attributesName: 'http://interop.gov.pt/MDC/Cidadao/NIC',
    };
    //token do CMD mais contexto
    const res = await fetch(
      'https://preprod.autenticacao.gov.pt/oauthresourceserver/api/AttributeManager',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    ).then((response) => response.json());

    //valores pedidos ao CMD
    const values = await fetch(
      'https://preprod.autenticacao.gov.pt/oauthresourceserver/api/AttributeManager?token=' +
        res.token +
        '&authenticationContextId=' +
        res.authenticationContextId,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    ).then((response) => response.json());

    //encontrar utilizador na DB
    var userfound = undefined
    for(let user of this.user_array){
      if (await bcrypt.compare(values[0].value, user.CC)){
        userfound = user
      }
    }

    if (userfound === undefined) {
      const hashed_CC = await bcrypt.hash(values[0].value, 10);
      //TODO Pedir login e dar match nessa pessoa (substituir CC por hash)
      return hashed_CC
    }
    if (userfound) {
      delete userfound.password;
      return {
        userId: userfound.id,
        userName: userfound.username,
      };
    }

  }
}
