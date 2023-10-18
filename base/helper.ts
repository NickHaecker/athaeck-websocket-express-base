import WebSocket from "ws";

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

    public addData(key: string, value: any) {
        this.data[key] = value;
    }
}
export function Broadcast(WSS: WebSocket.Server, body: (client: WebSocket) => void) {
    for (let client of WSS.clients) {
        body(client)
    }
}