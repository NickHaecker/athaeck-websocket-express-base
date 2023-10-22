import WebSocket from "ws";
import { BaseExpressApplication } from "../athaeck-express-base/base/express";
import { WebSocketHooks } from "./hooks";

export enum BaseWebSocketHook {
    CONNECTION = "connection", MESSAGE = "message"
}

export abstract class BaseWebSocketExpressAdoon extends BaseExpressApplication {
    protected webSocketServer: WebSocket.Server;
    protected webSocket: WebSocket.WebSocket;
    protected webSocketHooks: WebSocketHooks
    protected data: { [key: string]: any }

    constructor(port: number) {
        super()
        this.webSocketServer = new WebSocket.Server({ port })
        this.webSocketServer.on(BaseWebSocketHook.CONNECTION, this.OnConnection.bind(this))
        this.webSocketHooks = new WebSocketHooks()
    }

    public get WebSocket() {
        return this.webSocket
    }
    public get WebSocketHooks(){
        return this.webSocketHooks
    }
    public get WebSocketServer(): any {
        return this.webSocketServer
    }

    private OnConnection = (webSocket: WebSocket.WebSocket) => {
        this.webSocket = webSocket;
        this.webSocketHooks.DispatchHook(WebSocketHooks.NEW_CONNECTION,webSocket)
        this.Init()
    }
    protected abstract Init():void;

    public TakeBaseWebSocketListener(webSocketListener: BaseWebSocketListener): void {
        webSocketListener.TakeWebSocketServer(this);
    }
    public AddKey(key: string, value: any): void {
        this.data[key] = value;
    }
    public GetKey(key: string): any {
        return this.data[key]
    }

}

export abstract class BaseWebSocketListener {
    protected webSocketServer: BaseWebSocketExpressAdoon
    protected webSocket: WebSocket.WebSocket
    protected listenerKey: string

    constructor(key: string) {
        this.listenerKey = key
    }
    public get ListenerKey() {
        return this.listenerKey
    }

    listener = (body: any) => {

    }

    public TakeWebSocketServer(webSocketServer: BaseWebSocketExpressAdoon): void {
        this.webSocketServer = webSocketServer
        webSocketServer.WebSocketHooks.SubscribeHookListener(WebSocketHooks.NEW_CONNECTION,this.OnNewConnection.bind(this))
        this.Init()
    }
    private OnNewConnection(webSocket:WebSocket.WebSocket):void{
        this.webSocket = webSocket
        webSocket.on(this.ListenerKey, this.listener.bind(this));

    }
    protected abstract Init():void;
}

