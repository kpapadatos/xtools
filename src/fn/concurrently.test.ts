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

        concurrently([taskA, taskB, taskC], { concurrency: 1 });

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
    });
    it('should be able to catch error', async () => {
        let globalError: Error | undefined;
        process
            .once('unhandledRejection', e => { globalError = e as Error; })
            .once('uncaughtException', e => { globalError = e as Error; });

        let a = false;
        let b = false;
        let c = false;

        try {
            // await Promise.all([
            //     (async () => { await sleep(50); throw new Error(); })()
            // ]);

            await concurrently([
                () => { c = true; throw new Error('test'); },
                async () => { await sleep(50); a = true; throw new Error('test'); },
                async () => { b = true; throw new Error('test'); }
            ], { concurrency: 2 });
        } catch (e) {
            expect(a).true;
            expect(b).true;
            expect(c).true;

            // Wait for global error to be set
            await sleep(10);

            expect((e as Error)?.message).eq('test');
            expect(globalError, globalError?.stack).undefined;
        }
    });
});