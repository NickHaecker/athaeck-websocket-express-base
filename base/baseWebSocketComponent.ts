
import { WebSocket } from "ws"
import { BaseWebSocketExpressAdoon } from "."
import { WebSocketHooks } from "./hooks"

export abstract class BaseWebSocketComponent {
    protected socket: WebSocket
    protected hooks: WebSocketHooks
    protected server: BaseWebSocketExpressAdoon

    constructor(socket: WebSocket, hooks: WebSocketHooks) {
        this.socket = socket
        this.hooks = hooks
    }

    public get Socket(): WebSocket {
        return this.socket
    }
    public get Hooks(): WebSocketHooks {
        return this.hooks
    }
    public TakeWebSocketServer(webSocketServer: BaseWebSocketExpressAdoon):void{
        this.server = webSocketServer
    }
    public abstract BeforeDestroy(): void;
}