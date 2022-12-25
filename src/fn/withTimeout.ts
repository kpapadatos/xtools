import { defer } from './defer';

export default async function withTimeout<T>(fn: AsyncFunction<T>, options: IWithTimeoutOptions) {
    return await WithTimeout.execute(fn, options);
}

export class TimeoutError extends Error { public constructor() { super('Operation timed out.') } }

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

interface IWithTimeoutOptions { timeoutMs: number; }

class WithTimeout<T> {
    public static async execute<T>(fn: AsyncFunction<T>, options: IWithTimeoutOptions) {
        const runner = new WithTimeout(fn, options);
        return await runner.deferred.promise;
    }
    public readonly deferred = defer<T>();
    private timeoutRef: number;
    private constructor(
        private readonly fn: AsyncFunction<T>,
        private readonly options: IWithTimeoutOptions
    ) {
        this.timeoutRef = this.startTimeout();
        this.invoke();
    }
    private async invoke() {
        try {
            const result = await this.fn();

            if (!this.deferred.isFinished) {
                this.deferred.resolve(result);
            }
        } catch (e) {
            if (!this.deferred.isFinished) {
                this.deferred.reject(e);
            }
        } finally {
            clearTimeout(this.timeoutRef);
        }
    }
    private startTimeout() {
        // Capture a meaningful stack trace
        const timeoutError = new TimeoutError();

        return setTimeout(() => {
            if (!this.deferred.isFinished) {
                this.deferred.reject(timeoutError);
                this.deferred.isFinished = true;
            }
        }, this.options.timeoutMs);
    }
}
