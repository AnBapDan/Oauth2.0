export class tokens{
    static token= []

    static saveToken(token: any){
       
        tokens.token.push(token);
    }

    static findToken(token: any){
        
        const c = tokens.token.find(t => t === token);
        if(!c){
            return false;
        }
        return true;
    }

    static revokeToken(token: any){
        const startIndex = tokens.token.indexOf(token);

        if (startIndex !== -1) {
            tokens.token.splice(startIndex, 1);
            return {'message': 'token revoked'}
        }
        return {'error':'token invalid'}
    }
}