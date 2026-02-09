
import { WebSocket, WebSocketServer } from "ws";

//Guard helper functions:ensure socket is open before sending data
function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {// iterating over all the clients connected to the server
        if (client.readyState !== WebSocket.OPEN) continue;

        client.send(JSON.stringify(payload));
    }
}
/**
 * Will attach the socket logic to the nodejs server
 * HTTP will listen to handle REST req while WebSocket uses the same server to listen for upgrade requests
 * 
 */
export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ server, maxPayload: 1024 * 1024, path: '/ws' })  // ws reserved for live updates 
    
    wss.on('connection', (socket) => {
        sendJson(socket, { type: 'welcome' });

        socket.on('error', () => {
            socket.terminate();
        });
    });
    function broadcastMatchCreated(match){
        broadcast(wss,{ type: 'match_created', data: match })
    }
    return { broadcastMatchCreated }
}