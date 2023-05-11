import { expect } from 'chai';
import { concurrently } from './concurrently';
import { defer } from './defer';
import { sleep } from './sleep';

describe('concurrently', () => {
    it('should process less than limit', async () => {
        let taskAInvoked = false;
        let taskBInvoked = false;
        let taskCInvoked = false;
        const taskAHandle = defer();
        const taskBHandle = defer();
        const taskCHandle = defer();
        const taskA = async () => { taskAInvoked = true; await taskAHandle.promise; };
        const taskB = async () => { taskBInvoked = true; await taskBHandle.promise; };
        const taskC = async () => { taskCInvoked = true; await taskCHandle.promise; };

        const result = concurrently([taskA, taskB, taskC], { concurrency: 1 });

        expect(taskAInvoked).true;
        expect(taskBInvoked).false;
        expect(taskCInvoked).false;

        taskAHandle.resolve(null);
        await sleep(0);

        expect(taskAInvoked).true;
        expect(taskBInvoked).true;
        expect(taskCInvoked).false;

        taskBHandle.resolve(null);
        await sleep(0);

        expect(taskAInvoked).true;
        expect(taskBInvoked).true;
        expect(taskCInvoked).true;

        taskCHandle.resolve(null);
        await sleep(0);

        expect(await result).length(3);
    });
    it('should be able to catch error', async () => {
        await concurrently([async () => {
            await sleep(50);
            throw new Error('test');
        }], { concurrency: 1 })
            .catch(e => expect(e.message).eq('test'));
    });
});