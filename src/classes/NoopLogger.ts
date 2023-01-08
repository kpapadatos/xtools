import { Logger } from './Logger';

export class NoopLogger extends Logger {
    public log() { }
    public warn() { }
    public debug() { }
    public error() { }
    public info() { }
}