import { Logger } from './Logger';

export class ConsoleLogger extends Logger {
    public log(...args: any[]) {
        console.log(...args);
    }
    public warn(...args: any[]) {
        console.warn(...args);
    }
    public debug(...args: any[]) {
        console.debug(...args);
    }
    public error(...args: any[]) {
        console.error(...args);
    }
    public info(...args: any[]) {
        console.info(...args);
    }
}