import random
from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect
from controllers import templates, manager, permissions, agent
from fastapi.responses import RedirectResponse
import time

websocket = APIRouter(responses={404: {"description": "Not found"}})

flag = True #flag to activate result

@websocket.get("/g/{client_id}")
async def get(request:Request, client_id:str,permission: any = Depends(permissions)):
    if permission == "err":
        return RedirectResponse("http://localhost:8000/",307)

    for ws in manager.active_connections:
        if ws.path_params["client_id"] == client_id: 
            me = 0
            other = 0
            result = random.randint(1,4)
            if result == 1:
                other = 1
                me = -1
            elif result == 2:
                other = -1
                me = 1
            elif result == 3:
                other = 0
                me = 1
            elif result == 4:
                other = 1
                me = 0

            await manager.send_personal_message(f"{other}", ws)
            manager.disconnect(ws)
            return RedirectResponse("http://localhost:8000/gameresult/?result="+str(me), 303)
    return templates.TemplateResponse("loading.html", context={"request":request, "client_id": client_id, "FSkill": agent["Fskill"],"FBehaviour": agent["Fbehaviour"],"Game": agent["game"], "Username": agent["username"]})



@websocket.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            if flag:
                time.sleep(3)
                other = random.randint(-1,1)
                await manager.send_personal_message(f"{other}", websocket)
                manager.disconnect(websocket)
                return RedirectResponse("http://localhost:8000/gameresult/?result="+str(other), 303)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)