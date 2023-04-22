import { jsonStringifySafe } from '../fn/jsonStringifySafe';
import { Logger } from './Logger';

export class JSONLogger extends Logger {
    private readonly defaultOptions: IJSONLoggerOptions = {
        useDefaultFields: true,
        prefix: undefined,
        isPrefixRaw: false
    };
    private readonly options: IJSONLoggerOptions;
    public constructor(options?: Partial<IJSONLoggerOptions>) {
        super();
        this.options = {
            ...this.defaultOptions,
            ...options
        };
    }
    public log(input: any) { console.log(this.stringify(input)); }
    public warn(input: any) { console.warn(this.stringify(input)); }
    public debug(input: any) { console.debug(this.stringify(input)); }
    public error(input: any) { console.error(this.stringify(input)); }
    public info(input: any) { console.info(this.stringify(input)); }
    private stringify(input: any) {
        if (typeof input === 'string') {
            input = { m: input };
        }

        if (this.options.useDefaultFields) {
            input = {
                m: input.message,
                t: new Date(),
                stack: input.stack,
                ...input
            };
        }

        this.applyPrefixIfNeeded(input);

        return jsonStringifySafe(input);
    }
    private applyPrefixIfNeeded(input: any) {
        if (input.m && typeof input.m === 'string') {
            const prefix =
                this.options.isPrefixRaw ?
                    this.options.prefix :
                    `[${this.options.prefix}] `;
            input.m = `${prefix}${input.m}`;
        }
    }
}

export interface IJSONLoggerOptions {
    useDefaultFields?: boolean;
    prefix?: string;
    isPrefixRaw?: boolean;
}