import { BaseWebSocketConnector } from "./baseWebSocketConnector";

export interface TakeListener {
    TakeConnector(connector: BaseWebSocketConnector): void
    RemoveConnector(connector: BaseWebSocketConnector): void
}