export function defer<T>() {
    return new DeferredPromise<T>();
}

export class DeferredPromise<T> {
    public readonly promise: Promise<T>;
    public isFinished = false;
    private promiseResolve: (value: T) => void = () => undefined;
    private promiseReject: (reason?: any) => void = () => undefined;
    public constructor() {
        this.promise = new Promise<T>((res, rej) => {
            this.promiseResolve = res;
            this.promiseReject = rej;
        });
    }
    public resolve(value: T) {
        this.promiseResolve(value);
        this.isFinished = true;
    }
    public reject(reason?: any) {
        this.promiseReject(reason);
        this.isFinished = true;
    }
}