import { defer, DeferredPromise } from './defer';

export class TaskManager {
    private readonly taskBuffer: ITaskHandle[] = [];
    private readonly inFlightTaskBuffer: ITaskHandle[] = [];
    public constructor(private options: ITaskManagerOptions) { }
    public async enqueue<T>(taskFn: TaskFn<T>) {
        const handle = this.createTaskHandle(taskFn);
        this.taskBuffer.push(handle);

        this.processTaskBuffer();

        return await handle.deferred.promise;
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
    private async waitUntilNextTaskCompletes() {
        await Promise.race(this.inFlightTaskBuffer.map(task => task.deferred.promise));
    }
    private async invoke(handle: ITaskHandle) {
        this.inFlightTaskBuffer.push(handle);

        try {
            handle.deferred.resolve(await handle.taskFn());
        } catch (e) {
            handle.deferred.reject(e);
        }
    }
    private createTaskHandle<T>(taskFn: TaskFn<T>) {
        const deferred = defer<T>();

        const handle: ITaskHandle = {
            taskFn,
            deferred
        };

        handle.deferred.promise
            .finally(() => {
                const index = this.inFlightTaskBuffer.indexOf(handle);
                this.inFlightTaskBuffer.splice(index, 1);
            });

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