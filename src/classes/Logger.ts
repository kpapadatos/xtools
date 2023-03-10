export abstract class Logger {
    public abstract log(...args: any[]): void;
    public abstract warn(...args: any[]): void;
    public abstract debug(...args: any[]): void;
    public abstract error(...args: any[]): void;
    public abstract info(...args: any[]): void;
}