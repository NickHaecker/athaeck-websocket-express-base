import WebSocket from "ws";
import { BaseWebSocketExpressAdoon, BaseWebSocketHook, BaseWebSocketListener } from ".";
import { WebSocketHooks } from "./hooks";

export function GetGUID(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
export class ReceivedEvent {
    public eventName: string;
    public data: { [key: string]: any };

    constructor(name: string) {
        this.eventName = name;
        this.data = {};
    }

    public get JSONString() {
        return JSON.stringify(this.data)
    }

    public addData(key: string, value: any) {
        this.data[key] = value;
    }

}

export function Broadcast(WSS: WebSocket.Server, body: (client: WebSocket) => void) {
    for (let client of WSS.clients) {
        body(client)
    }
}

export class StandardWebSocketDistributor extends BaseWebSocketListener {
    listenerKey: string;

    constructor(webSocketServer: BaseWebSocketExpressAdoon, webSocket: WebSocket.WebSocket,hooks:WebSocketHooks) {
        super(webSocketServer,webSocket,hooks)
        this.listenerKey = BaseWebSocketHook.MESSAGE
    }
    listener = (body: any) => {
        const jsonBody = JSON.parse(body.toString());
        const event = jsonBody.hasOwnProperty("eventName") ? jsonBody["eventName"] : ""
        const data = jsonBody.hasOwnProperty("data") ? jsonBody["data"] : ""
        console.log(event)
        this.webSocket.emit(event, data)
    }

}
