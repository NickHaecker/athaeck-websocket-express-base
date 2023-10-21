import { EventEmitter } from "events"

export class WebSocketHooks extends EventEmitter {
    public static readonly NEW_CONNECTION = "NEW_CONNECTION"
    public DispatchHook(hook: string, body: any) {
        this.emit(hook, body)
    }
    public SubscribeHookListener(hook: string, listener: (data: any) => void) {
        this.on(hook, listener);
    }
    public UnSubscribeListener(hook: string, listener: (data: any) => void) {
        this.off(hook, listener)
    }
}