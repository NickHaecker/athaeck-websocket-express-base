import WebSocket from "ws";
import { BaseExpressApplication } from "../athaeck-express-base/base/express";

export enum BaseWebSocketHook {
    CONNECTION = "connection", MESSAGE = "message"
}

export abstract class BaseWebSocketExpressAdoon extends BaseExpressApplication {
    protected webSocketServer: WebSocket.Server;
    protected webSocket: WebSocket.WebSocket;

    protected data: { [key: string]: any }

    constructor(port: number) {
        super()
        this.webSocketServer = new WebSocket.Server({ port })
        this.webSocketServer.on(BaseWebSocketHook.CONNECTION, this.OnConnection.bind(this))
    }

    public get WebSocket() {
        return this.webSocket
    }

    public get WebSocketServer(): any {
        return this.WebSocketServer
    }

    private OnConnection = (webSocket: WebSocket.WebSocket) => {
        this.webSocket = webSocket;
        this.Init()
    }
    protected abstract Init():void;
    public TakeBaseWebSocketListener(webSocketListener: BaseWebSocketListener): void {
        webSocketListener.TakeWebSocketServer(this);
        this.webSocket.on(webSocketListener.ListenerKey, webSocketListener.listener);
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
        this.Init()
    }
    protected abstract Init():void;
}

