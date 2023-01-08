import { jsonStringifySafe } from '../fn/jsonStringifySafe';
import { Logger } from './Logger';

export class JSONLogger extends Logger {
    public constructor(private options: IJSONLoggerOptions) { super(); }
    public log(input: any) { console.log(this.stringify(input)); }
    public warn(input: any) { console.warn(this.stringify(input)); }
    public debug(input: any) { console.debug(this.stringify(input)); }
    public error(input: any) { console.error(this.stringify(input)); }
    public info(input: any) { console.info(this.stringify(input)); }
    private stringify(input: any) {
        if (this.options.useDefaultFields) {
            input = {
                message: input.message,
                ts: new Date(),
                stack: input.stack,
                ...input
            };
        }

        return jsonStringifySafe(input);
    }
}

export interface IJSONLoggerOptions {
    useDefaultFields: boolean;
}