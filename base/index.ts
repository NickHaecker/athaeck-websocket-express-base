import WebSocket from "ws";
import { BaseExpressApplication } from "../athaeck-express-base/base/express";
import { WebSocketHooks } from "./hooks";

export enum BaseWebSocketHook {
    CONNECTION = "connection", MESSAGE = "message"
}

export type OpenConnection={
    socket:WebSocket.WebSocket,
    hooks:WebSocketHooks
}

export abstract class BaseWebSocketExpressAdoon extends BaseExpressApplication {
    protected webSocketServer: WebSocket.Server;
    protected webSocketHooks: WebSocketHooks
    protected factory: WebSocketListenerFactory

    constructor(port: number) {
        super()
        this.webSocketServer = new WebSocket.Server({ port })
        this.webSocketServer.on(BaseWebSocketHook.CONNECTION, this.OnConnection.bind(this))
        this.webSocketHooks = new WebSocketHooks()
    }

    public get WebSocketHooks() {
        return this.webSocketHooks
    }
    public get WebSocketServer(): any {
        return this.webSocketServer
    }

    private OnConnection = (webSocket: WebSocket.WebSocket) => {
        const hooks: WebSocketHooks = new WebSocketHooks()
        this.factory.CreateListener(webSocket, this,hooks)
    }   
    abstract Init(webSocket:WebSocket.WebSocket,hooks:WebSocketHooks):void

}

export abstract class BaseWebSocketListener {
    protected webSocketServer: BaseWebSocketExpressAdoon
    protected webSocket: WebSocket.WebSocket
    abstract listenerKey: string
    protected webSocketHooks:WebSocketHooks

    constructor(webSocketServer: BaseWebSocketExpressAdoon, webSocket: WebSocket.WebSocket,hooks: WebSocketHooks) {
        this.webSocketServer = webSocketServer
        this.webSocket = webSocket
        this.webSocketHooks = hooks
        this.webSocket.on(this.ListenerKey, this.listener.bind(this));

    }
    public get ListenerKey() {
        return this.listenerKey
    }

    listener = (body: any) => {

    }
}
export abstract class WebSocketListenerFactory {
    protected webSocketListener: any[] = []
    constructor() {
        this.TakeListener()
    }
    protected abstract TakeListener(): void
    protected AddListener(listener: any[]){
        this.webSocketListener = listener
    }
    public CreateListener(webSocket: WebSocket.WebSocket, expressApplicationAddon: BaseWebSocketExpressAdoon,hooks:WebSocketHooks) {
        for (const Listener of this.webSocketListener) {
            if(!Listener){
                return;
            }
            new Listener(expressApplicationAddon, webSocket,hooks)
        }
    }
}

