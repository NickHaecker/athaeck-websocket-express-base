import WebSocket, { Server } from "ws";
import { BaseExpressApplication } from "../athaeck-express-base/base/express";
import { WebSocketHooks } from "./hooks";

export enum BaseWebSocketHook {
  CONNECTION = "connection",
  MESSAGE = "message",
  CLOSE = "close",
}

export type OpenConnection = {
  socket: WebSocket.WebSocket;
  hooks: WebSocketHooks;
};

export abstract class BaseWebSocketExpressAdoon extends BaseExpressApplication {
  protected webSocketServer: WebSocket.Server;
  protected factory: WebSocketListenerFactory;

  constructor(port: number) {
    super();
    this.webSocketServer = new WebSocket.Server({ port });
    this.webSocketServer.on(
      BaseWebSocketHook.CONNECTION,
      this.OnConnection.bind(this)
    );
    this.webSocketServer.on(BaseWebSocketHook.CLOSE, this.OnClose.bind(this));
  }

  public get WebSocketServer(): WebSocket.Server {
    return this.webSocketServer;
  }

  private OnClose = (webSocketServer: Server) => {
    console.log("Server closed")
    this.webSocketServer.off(
      BaseWebSocketHook.CONNECTION,
      this.OnConnection.bind(this)
    );
  };

  private OnConnection = (webSocket: WebSocket.WebSocket) => {
    console.log("new connection");

    webSocket.on(BaseWebSocketHook.CLOSE, (code: number, reason: string) => {
      this.OnDisconnection(webSocket);
    });

    if (!this.ValidateConnection(webSocket)) {
      webSocket.close();
      return;
    }

    const hooks: WebSocketHooks = this.CreateHooks();
    this.factory.CreateListener(webSocket, this, hooks);
    this.Init(webSocket, hooks);
  };

  protected abstract ValidateConnection(
    webSocket: WebSocket.WebSocket
  ): boolean;

  protected abstract CreateHooks(): WebSocketHooks;

  private OnDisconnection(webSocket: WebSocket.WebSocket) {
    console.log("disconnection");

    webSocket.off(BaseWebSocketHook.CLOSE, (code: number, reason: string) => {
      this.OnDisconnection(webSocket);
    });

    const hooks: WebSocketHooks | undefined = this.Disconnect(webSocket);

    if (!hooks) {

      return;
    }

    this.factory.RemoveListener(webSocket, hooks);
  };

  abstract Init(webSocket: WebSocket.WebSocket, hooks: WebSocketHooks): void;

  abstract Disconnect(
    webSocket: WebSocket.WebSocket
  ): WebSocketHooks | undefined;
}

export abstract class BaseWebSocketListener {
  protected webSocketServer: BaseWebSocketExpressAdoon;
  protected webSocket: WebSocket.WebSocket;
  abstract listenerKey: string;
  protected webSocketHooks: WebSocketHooks;

  constructor(
    webSocketServer: BaseWebSocketExpressAdoon,
    webSocket: WebSocket.WebSocket,
    hooks: WebSocketHooks
  ) {
    this.webSocketServer = webSocketServer;
    this.webSocket = webSocket;
    this.webSocketHooks = hooks;

    this.SetKey();
    this.webSocket.on(this.ListenerKey, this.listener.bind(this));
  }
  public get WebSocket(): WebSocket.WebSocket {
    return this.webSocket;
  }
  protected abstract SetKey(): void;

  public get ListenerKey(): string {
    return this.listenerKey;
  }
  public OnDisconnect(webSocket: WebSocket.WebSocket, hook: WebSocketHooks) {
    this.webSocket.off(this.ListenerKey, this.listener.bind(this));
    this.OnDisconnection(webSocket, hook);
  }
  public abstract OnDisconnection(
    webSocket: WebSocket.WebSocket,
    hooks: WebSocketHooks
  ): void;
  protected abstract listener(body: any): void;
}

export abstract class WebSocketListenerFactory {
  protected webSocketListener: any[] = [];
  protected activeListener: BaseWebSocketListener[] = [];
  protected rootFolder: string;
  constructor(root: string) {
    this.rootFolder = root;
    this.TakeListener();
  }
  protected abstract TakeListener(): void;
  protected AddListener(listener: any[]) {
    this.webSocketListener = listener;
  }
  public CreateListener(
    webSocket: WebSocket.WebSocket,
    expressApplicationAddon: BaseWebSocketExpressAdoon,
    hooks: WebSocketHooks
  ) {
    if (this.webSocketListener.length === 0) {
      return;
    }
    for (const Listener of this.webSocketListener) {
      const l: BaseWebSocketListener = new Listener(
        expressApplicationAddon,
        webSocket,
        hooks
      );
      this.activeListener.push(l);
    }
  }
  public RemoveListener(webSocket: WebSocket.WebSocket, hooks: WebSocketHooks) {
    const newListener: BaseWebSocketListener[] = [];

    for (const listener of this.activeListener) {
      if (listener.WebSocket !== webSocket) {
        newListener.push(listener);
      } else {
        listener.OnDisconnect(webSocket, hooks);
      }
    }
    this.activeListener = newListener;
  }
}
