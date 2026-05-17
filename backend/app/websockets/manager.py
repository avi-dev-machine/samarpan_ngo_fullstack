from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str = "global"):
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    def disconnect(self, websocket: WebSocket, room: str = "global"):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)

    async def broadcast(self, message: dict, room: str = "global"):
        if room in self.active_connections:
            dead = []
            for conn in self.active_connections[room]:
                try:
                    await conn.send_json(message)
                except Exception:
                    dead.append(conn)
            for d in dead:
                self.active_connections[room].remove(d)

    async def broadcast_all(self, message: dict):
        for room in list(self.active_connections.keys()):
            await self.broadcast(message, room)

    async def send_personal(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            pass


manager = ConnectionManager()
