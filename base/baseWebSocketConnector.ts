import { BaseWebSocketExpressAdoon } from "."
import { BaseWebSocketComponent } from "./baseWebSocketComponent"


export abstract class BaseWebSocketConnector {
    protected components: BaseWebSocketComponent[] = []
    protected socket: BaseWebSocketExpressAdoon

    constructor(socket: BaseWebSocketExpressAdoon) {
        this.socket = socket
    }
    public TakeWebSocketComponent(webSocketComponent: BaseWebSocketComponent): void {
        this.components.push(webSocketComponent)

        webSocketComponent.TakeWebSocketConnector(this)
    }
    public RemoveWebSocketComponent(webSocketComponent: BaseWebSocketComponent): void {


        webSocketComponent.RemoveWebSocketConnector(this)
    }
}