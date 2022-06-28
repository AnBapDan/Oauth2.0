import * as crypto from 'crypto';

export class cookies{

    static cookies = [];

    static saveCookie(user: any){
        var cookie = crypto.randomBytes(16).toString('hex');
        cookies.cookies.push({user,cookie});

        return cookie;
    
    }

    static findUserByCookie(cookie: any){
        
        const c = cookies.cookies.find(c => c.cookie === cookie['oauth-cookie']);
        if(!c){
            return null;
        }
        return c.user;
    }

    static findUserByCookies(cookiev:string){
        const c = cookies.cookies.find(c => c.cookie === cookiev);
        if(!c){
            return null;
        }
        return c.user;
    }
}