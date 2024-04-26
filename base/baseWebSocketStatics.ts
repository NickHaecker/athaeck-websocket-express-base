import { BaseWebSocketExpressAdoon } from ".";
import { BaseWebSocketConnector } from "./baseWebSocketConnector";



export abstract class BaseWebSocketStatic {
    protected webSocketServer: BaseWebSocketExpressAdoon
    protected connector: BaseWebSocketConnector

    constructor(webSocketServer: BaseWebSocketExpressAdoon, connector: BaseWebSocketConnector) {
        this.webSocketServer = webSocketServer
        this.connector = connector

        this.InitEventListener(connector)
    }
    protected abstract InitEventListener(connector: BaseWebSocketConnector): void;
}