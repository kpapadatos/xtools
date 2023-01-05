import { AsyncReturnType } from './AsyncReturnType';
import { sleep } from './sleep';

const defaultOptions: IWithRetriesOptions = {
    retries: 1,
    isAborted() { return false; },
    onError() { },
    retryIntervalMultiplier: 100
};

export default async function withRetries<T extends (...args: any) => any>(
    task: T,
    partialOptions: Partial<IWithRetriesOptions> = {}
): Promise<AsyncReturnType<typeof task>> {
    const options: IWithRetriesOptions = { ...defaultOptions, ...partialOptions };

    let tries = options.retries + 1;
    let lastError: Error | undefined;

    while (tries-- && !options.isAborted()) {
        const { success, result } = await tryTask(task);

        if (success) {
            return result;
        }

        lastError = result;
        options.onError?.(lastError);

        await waitForRetryInterval(tries, options.retries, options.retryIntervalMultiplier);
    }

    throw lastError;
}

async function tryTask(
    task: Function
) {
    try {
        return { success: true, result: await task() };
    } catch (e) {
        return { success: false, result: e };
    }
}

async function waitForRetryInterval(triesRemaining: number, maxRetries: number, retryIntervalMultiplier: number) {
    if (triesRemaining) {
        await sleep(retryIntervalMultiplier * (maxRetries - triesRemaining) + (Math.random() * 3));
    }
}

interface IWithRetriesOptions {
    retries: number;
    retryIntervalMultiplier: number;
    onError: (e?: Error) => void;
    isAborted: () => boolean;
}