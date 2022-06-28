import { Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken";
import { data } from './utils/database';
import fetch from 'node-fetch';

var d = data

@Injectable()
export class AppService {

  async VerifyJwt(token: string){
    try {
      jwt.verify(token, "projiaa2")
      const result = await fetch('http://localhost:3001/findToken', {
        method: 'GET',
        body: token,
        });
      return true;
    } 
    catch(err) {
      return false;
    }
  }

  RetrieveData(token: string, nbins: number){
    const decoded = jwt.verify(token, "projiaa2");
    const jsonobj = JSON.stringify(decoded)
    var array = JSON.parse(jsonobj)
    const username = array.user.userName
    const scope = array.scope
    var fskill = this.Fskill(nbins, username,scope)
    var fbehav = this.Fbehaviour(nbins, username,scope)
    return "Fskill: "+fskill+", Fbehaviour: "+fbehav
  }

  UpdateData(token:string, result:number){
    const decoded = jwt.verify(token, "projiaa2");
    const jsonobj = JSON.stringify(decoded)
    var array = JSON.parse(jsonobj)
    const username = array.user.userName
    const scope = array.scope
    var position = d.findIndex(user => user.username === username);
    //Result == 0 is cheating; == 1 win, == -1 lose
    if (result === 0){
      if(scope === "chess"){
        d[position].chess[1] = String(Number(d[position].chess[1]) +1)
     }else if(scope === "cards"){
       d[position].cards[1] = String(Number(d[position].cards[1]) +1)
     }else{
       d[position].checkers[1] = String(Number(d[position].checkers[1]) +1)
     }
    }
    else{
      if(scope === "chess"){
        d[position].chess[0] = String(Number(d[position].chess[0]) - result)
     }else if(scope === "cards"){
       d[position].cards[0] = String(Number(d[position].cards[0]) - result)
     }else{
       d[position].checkers[0] = String(Number(d[position].checkers[0]) - result)
     }
    }

    
  }

  Fskill(nbins: number, username: string, scope:string){
    var position = d.findIndex(user => user.username === username);
    if(position === -1){
      d.push({
        username: username,
        chess:["50","50"],
        cards:["50","50"],
        checkers:["50","50"],
      })
    }
    if(scope === "chess"){
      d = d.sort(function(a, b){
        return Number(a.chess[0]) - Number(b.chess[0]);
      })
    }else if(scope === "cards"){
      d = d.sort(function(a, b){
        return Number(a.cards[0]) - Number(b.cards[0]);
      })
    }else{
      d = d.sort(function(a, b){
        return Number(a.checkers[0]) - Number(b.checkers[0]);
      })
    }
    
    position = d.findIndex(user => user.username === username);
    var total = d.length
    var block = Math.floor(total/nbins)
    var count = 1
    while(position > block){
      block += block
      count++
    }
    return ""+count+"/"+nbins
  }

  Fbehaviour(nbins: number, username: string, scope:string){
    if(scope === "chess"){
      d = d.sort(function(a, b){
        return Number(a.chess[1]) - Number(b.chess[1]);
      })
    }else if(scope === "cards"){
      d = d.sort(function(a, b){
        return Number(a.cards[1]) - Number(b.cards[1]);
      })
    }else{
      d = d.sort(function(a, b){
        return Number(a.checkers[1]) - Number(b.checkers[1]);
      })
    }
    var position = d.findIndex(user => user.username === username);
    var total = d.length
    var block = Math.floor(total/nbins)
    var count = 1
    while(position > block){
      block += block
      count++
    }
    return ""+count+"/"+nbins
  }


}
