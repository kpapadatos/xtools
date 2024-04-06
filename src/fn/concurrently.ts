import { ITaskManagerOptions, TaskFn, TaskManager } from './TaskManager';

export function concurrently<T>(tasks: TaskFn<T>[], options: ITaskManagerOptions) {
    const taskManager = new TaskManager(options);

    return Promise.all(tasks.map(task => taskManager.enqueue(task)));
}