import WebSocket from "ws";
import { BaseExpressApplication } from "../athaeck-express-base/base/express";
import { WebSocketHooks } from "./hooks";

export enum BaseWebSocketHook {
    CONNECTION = "connection", MESSAGE = "message", CLOSE = "close"
}

export type OpenConnection = {
    socket: WebSocket.WebSocket,
    hooks: WebSocketHooks
}





export abstract class BaseWebSocketExpressAdoon extends BaseExpressApplication {
    protected webSocketServer: WebSocket.Server;
    protected factory: WebSocketListenerFactory

    constructor(port: number) {
        super()
        this.webSocketServer = new WebSocket.Server({ port })
        this.webSocketServer.on(BaseWebSocketHook.CONNECTION, this.OnConnection.bind(this))
        this.webSocketServer.on(BaseWebSocketHook.CLOSE, this.OnDisconnection.bind(this))
    }

    public get WebSocketServer(): WebSocket.Server {
        return this.webSocketServer
    }

    private OnConnection = (webSocket: WebSocket.WebSocket) => {
        console.log("new connection")
        const hooks: WebSocketHooks = new WebSocketHooks()
        this.factory.CreateListener(webSocket, this, hooks)
        this.Init(webSocket, hooks)
    }
    private OnDisconnection = (webSocket: WebSocket.WebSocket) => {
        console.log("disconnect")
        const hooks: WebSocketHooks | undefined = this.Disconnect(webSocket)
        if (!hooks) {
            return
        }
        this.factory.RemoveListener(webSocket, hooks)
    }
    abstract Init(webSocket: WebSocket.WebSocket, hooks: WebSocketHooks): void
    abstract Disconnect(webSocket: WebSocket.WebSocket): WebSocketHooks | undefined
}





export abstract class BaseWebSocketListener {
    protected webSocketServer: BaseWebSocketExpressAdoon
    protected webSocket: WebSocket.WebSocket
    abstract listenerKey: string
    protected webSocketHooks: WebSocketHooks

    constructor(webSocketServer: BaseWebSocketExpressAdoon, webSocket: WebSocket.WebSocket, hooks: WebSocketHooks) {
        this.webSocketServer = webSocketServer
        this.webSocket = webSocket
        this.webSocketHooks = hooks
        this.Init()

        this.SetKey()
        this.webSocket.on(this.ListenerKey, this.listener.bind(this));
    }
    public get WebSocket():WebSocket.WebSocket {
        return this.webSocket
    }
    protected abstract Init(): void
    protected abstract SetKey(): void;

    public get ListenerKey():string {
        return this.listenerKey
    }
    public OnDisconnect(webSocket: WebSocket.WebSocket, hook: WebSocketHooks) {
        this.webSocket.off(this.ListenerKey, this.listener.bind(this));
        this.OnDisconnection(webSocket, hook)
    }
    public abstract OnDisconnection(webSocket: WebSocket.WebSocket, hooks: WebSocketHooks): void
    protected abstract listener(body: any): void;
}




export abstract class WebSocketListenerFactory {
    protected webSocketListener: any[] = []
    protected activeListener: BaseWebSocketListener[] = []
    constructor() {
        this.TakeListener()
    }
    protected abstract TakeListener(): void
    protected AddListener(listener: any[]) {
        this.webSocketListener = listener
    }
    public CreateListener(webSocket: WebSocket.WebSocket, expressApplicationAddon: BaseWebSocketExpressAdoon, hooks: WebSocketHooks) {
        if (this.webSocketListener.length === 0) {
            return;
        }
        for (const Listener of this.webSocketListener) {
            const l: BaseWebSocketListener = new Listener(expressApplicationAddon, webSocket, hooks)
            this.activeListener.push(l)
        }
        console.log("created listener",this.activeListener)
    }
    public RemoveListener(webSocket: WebSocket.WebSocket, hooks: WebSocketHooks) {
        const newListener: BaseWebSocketListener[] = []

        for (const listener of this.activeListener) {
            if (listener.WebSocket !== webSocket) {
                newListener.push(listener)

            } else {
                listener.OnDisconnect(webSocket, hooks)
            }
        }
        this.activeListener = newListener
    }
}

