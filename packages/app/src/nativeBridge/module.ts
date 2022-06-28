import { BrowserWindow, ipcRenderer, IpcRendererEvent } from 'electron';

type InvokableFunction = {
  name: string;
  invocation: (mainWindow: BrowserWindow, ...args: any[]) => Promise<any>;
};

export abstract class NativeBridgeModule {
  constructor(public readonly moduleName: string) {}

  public getModuleKey(): string {
    return `wowarenalogs:${this.moduleName}`;
  }

  public getInvocationKey(functionName: string) {
    return `${this.getModuleKey()}:${functionName}`;
  }

  public getEventKey(eventName: string): string {
    return `${this.getModuleKey()}:${eventName}`;
  }

  /**
   * Callback after module is registered in case any bespoke action is needed
   * Useful for mapping events on the mainWindow into module domain events
   */
  public onRegistered(_mainWindow: BrowserWindow): void {}

  /**
   * List of functions that will be exposed as imperatives on the renderer api
   * the api will use the [name] and execute [invocation]
   */
  public abstract getInvokables(): InvokableFunction[];
}
