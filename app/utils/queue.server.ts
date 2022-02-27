import type { Processor } from "bullmq";
import { Queue as BullQueue, Worker, QueueScheduler } from "bullmq";
import IORedis from "ioredis";

type RegisteredQueue = {
	queue: BullQueue;
	worker: Worker;
	scheduler: QueueScheduler;
};

declare global {
	var __registeredQueues: Record<string, RegisteredQueue> | undefined;
}

const registeredQueues = global.__registeredQueues || (global.__registeredQueues = {});

export function Queue<Payload>(name: string, handler: Processor<Payload>, redis: IORedis.Redis): BullQueue<Payload> {
	if (registeredQueues[name]) {
		return registeredQueues[name].queue;
	}

	const queue = new BullQueue<Payload>(name, {
		connection: redis,
		defaultJobOptions: {
			removeOnComplete: true,
			removeOnFail: true
		}
	});
	const worker = new Worker<Payload>(name, handler, { connection: redis });
	const scheduler = new QueueScheduler(name, { connection: redis });

	registeredQueues[name] = { queue, scheduler, worker };

	return queue;
}
