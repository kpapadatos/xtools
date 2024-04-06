import { defer, DeferredPromise } from './defer';

export class TaskManager {
    private readonly taskBuffer: ITaskHandle[] = [];
    private readonly inFlightTaskBuffer: ITaskHandle[] = [];
    public constructor(private options: ITaskManagerOptions) { }
    public enqueue<T>(taskFn: TaskFn<T>) {
        const handle = this.createTaskHandle(taskFn);
        this.taskBuffer.push(handle);

        this.processTaskBuffer();

        return handle.deferred.promise;
    }
    private processTaskBuffer() {
        while (this.hasPendingTasks() && this.hasConcurrencySlot()) {
            const handle = this.taskBuffer.shift()!;
            this.invoke(handle);

            if (!this.hasConcurrencySlot()) {
                this.waitUntilNextTaskCompletes()
                    .then(this.processTaskBuffer.bind(this));

                break;
            }
        }
    }
    private hasPendingTasks() {
        return Boolean(this.taskBuffer.length);
    }
    private hasConcurrencySlot() {
        return Boolean(this.inFlightTaskBuffer.length < this.options.concurrency);
    }
    private waitUntilNextTaskCompletes() {
        return Promise.race(this.inFlightTaskBuffer.map(task => task.deferred.promise.catch(() => { })));
    }
    private invoke(handle: ITaskHandle) {
        const after = () => {
            const index = this.inFlightTaskBuffer.indexOf(handle);
            this.inFlightTaskBuffer.splice(index, 1);
        };

        this.inFlightTaskBuffer.push(handle);

        try {
            const result = handle.taskFn();

            if (result instanceof Promise) {
                result
                    .then(
                        value => handle.deferred.resolve(value),
                        error => handle.deferred.reject(error)
                    )
                    .finally(after);
            } else {
                handle.deferred.resolve(result);
                after();
            }
        } catch (error) {
            handle.deferred.reject(error);
            after();
        }
    }
    private createTaskHandle<T>(taskFn: TaskFn<T>) {
        const deferred = defer<T>();

        const handle: ITaskHandle = {
            taskFn,
            deferred
        };

        return handle;
    }
}

export interface ITaskManagerOptions {
    concurrency: number;
}

export type TaskFn<T> = () => Promise<T>;

export interface ITaskHandle<T = any> {
    taskFn: TaskFn<T>;
    deferred: DeferredPromise<T>;
}