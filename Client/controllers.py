from fractions import Fraction
from fastapi import APIRouter, Depends, Request
from connection import ConnectionManager
from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
import requests

manager = ConnectionManager()
#Templates html
templates = Jinja2Templates(directory="templates")

#Client Setup
client = APIRouter(responses={404: {"description": "Not found"}})
client_id = "123abc"
client_secret = "secretclient"
clientcon = AsyncOAuth2Client(client_id, client_secret, scope='None', redirect_uri="http://localhost:8000/tm")

agent = {
    "username": "",
    "token":None,
    "nbins":10,
    "skill":0,
    "behaviour":0,
    "state":"",
    "game":"",
    "Fskill":"",
    "Fbehaviour":""
    }
async def permissions():
    if agent["token"] == None or agent["token"]== {'access_token': 'invalid', 'token_type': 'Bearer'}:
        return "err"
    return "ok"


authorization_endpoint = 'http://localhost:3001/auth'

@client.get("/")
def index(request: Request):
  return templates.TemplateResponse("index.html", context={"request":request, "link": "http://localhost:8000/"}) 

@client.post("/")
async def index(req: Request):
    form = await req.form()
    user = form.get("username")
    agent["username"] = user
    agent["skill"] = form.get("skill")
    agent["behaviour"] = form.get("behaviour")
    agent["nbins"] = form.get("nbins")
    agent["token"] = None
    return RedirectResponse("http://localhost:8000/game", 303)

@client.get("/game")
async def choose_game(request:Request):    

    return templates.TemplateResponse("TMgames.html", context={"request":request, "oauth":"http://localhost:8000/game"}) 

@client.post("/game")
async def save_defs_game(request:Request):
    form = await request.form()
    agent["game"] = form.get("play")
    clientcon.scope=agent["game"]
    uri, state = clientcon.create_authorization_url(authorization_endpoint)
    agent["state"] = state
    return RedirectResponse(uri, 303)

@client.get("/tm")
async def callback(request:Request):
    authorization_response = "http://localhost:8000/tm?"
    authorization_response += "code="+request.query_params["code"]
    authorization_response += "&state="+request.query_params["state"]

    agent["token"] = await clientcon.fetch_token("http://localhost:3001/token"
    , authorization_response=authorization_response
    , client_id="123abc"
    , client_secret="projiaa2" )
    
    headers = {'Authorization' : agent["token"].get("token_type")+" "+ agent["token"].get("access_token")}

    ###TOKEN###
    print(headers)

    
    stats = requests.post('http://localhost:3002/'
    , headers = headers
    , json ={'nbins': agent["nbins"], 'scope': agent["game"]})

    fs = stats.text.split(",")
    agent["Fskill"]= fs[0].split(":")[1].replace(" ","")
    agent["Fbehaviour"]= fs[1].split(":")[1].replace(" ","")

    for item in manager.active_connections:
        p = item.path_params["client_id"]
        p = p.split("_")
        count = 0
        #/2_1_3_-1_-1_cards
        if p[5] != agent["game"]:
            break
        if int(p[3]) <= 0 and int(agent["skill"]) >= 0:
            if Fraction(p[0],p[2]) >= Fraction(agent["Fskill"]):
                count += 1

        if int(p[3]) >= 0 and int(agent["skill"]) <= 0:
            if Fraction(p[0],p[2]) <= Fraction(agent["Fskill"]):
                count += 1

        if int(p[4]) <= 0 and int(agent["behaviour"]) >= 0:
            if Fraction(p[1],p[2]) >= Fraction(agent["Fbehaviour"]):
                count += 1
        
        if int(p[4]) >= 0 and int(agent["behaviour"]) <= 0:
            if Fraction(p[1],p[2]) <=Fraction(agent["Fbehaviour"]):
                count += 1

        if count == 2:
            return RedirectResponse("http://localhost:8000/g/"+item.path_params["client_id"], 303)

    return RedirectResponse("http://localhost:8000/g/"+agent["Fskill"].split("/")[0]+"_"+agent["Fbehaviour"].split("/")[0]+"_"+agent["Fbehaviour"].split("/")[1]+\
        "_"+agent["skill"]+"_"+agent["behaviour"]+"_"+agent["game"], 303)


@client.get("/gameresult/")
async def get(request:Request, result:str, permission : any = Depends(permissions)):
    if permission == "err":
        return RedirectResponse("http://localhost:8000/",307)

    message =""
    if result == "0":
        message = "You Cheated! Shame on you!"
    elif result == "-1":
        message = "You Lost! Better Luck next time!"
    elif result == "1":
        message = "You Won! Congratulation!"

    headers = {'Authorization' : agent["token"].get("token_type")+" "+ agent["token"].get("access_token")}
    stat = requests.post('http://localhost:3002/'
    , headers = headers
    , json ={'result': int(result)})
    agent["token"]= {'access_token': 'invalid', 'token_type': 'Bearer'}


    return templates.TemplateResponse("result.html", context={"request":request,"message":message})

