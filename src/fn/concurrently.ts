import { ITaskManagerOptions, TaskFn, TaskManager } from './TaskManager';

export async function concurrently<T>(tasks: TaskFn<T>[], options: ITaskManagerOptions) {
    const taskManager = new TaskManager(options);
    const taskPromises: Promise<T>[] = [];

    for (const task of tasks) {
        taskPromises.push(taskManager.enqueue(task));
    }

    return await Promise.all(taskPromises);
}