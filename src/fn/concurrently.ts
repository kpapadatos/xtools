import { ITaskManagerOptions, TaskFn, TaskManager } from './TaskManager';

export function concurrently<T>(tasks: TaskFn<T>[], options: ITaskManagerOptions) {
    const taskManager = new TaskManager(options);

    tasks.map(task => taskManager.enqueue(task));

    return taskManager.waitUntilIdle();
}