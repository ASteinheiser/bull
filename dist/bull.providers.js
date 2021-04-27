"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueueProviders = exports.createQueueOptionProviders = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
const helpers_2 = require("./utils/helpers");
function buildQueue(option) {
    const queue = new bullmq_1.Queue(option.name ? option.name : 'default', option);
    const workers = [];
    const scheduler = new bullmq_1.QueueScheduler(queue.name, option);
    if (option.processors) {
        option.processors.forEach((processor) => {
            if (helpers_2.isAdvancedProcessor(processor)) {
                workers.push(new bullmq_1.Worker(queue.name, processor.callback, {
                    concurrency: processor.concurrency,
                    connection: option.connection,
                }));
            }
            else if (helpers_2.isAdvancedSeparateProcessor(processor)) {
                workers.push(new bullmq_1.Worker(queue.name, processor.path, {
                    concurrency: processor.concurrency,
                    connection: option.connection,
                }));
            }
            else if (helpers_2.isSeparateProcessor(processor)) {
                workers.push(new bullmq_1.Worker(queue.name, processor, {
                    connection: option.connection,
                }));
            }
            else if (helpers_2.isProcessorCallback(processor)) {
                workers.push(new bullmq_1.Worker(queue.name, processor, {
                    connection: option.connection,
                }));
            }
        });
    }
    queue.onApplicationShutdown = function () {
        return Promise.all([...workers.map((w) => w.close()), this.close(), scheduler.close()]);
    };
    return queue;
}
function createQueueOptionProviders(options) {
    const providers = options.map((option) => {
        const optionalSharedConfigHolder = helpers_1.createConditionalDepHolder(utils_1.getSharedConfigToken(option.configKey));
        return [
            optionalSharedConfigHolder,
            {
                provide: utils_1.getQueueOptionsToken(option.name),
                useFactory: (optionalDepHolder) => {
                    return Object.assign(Object.assign({}, optionalDepHolder.getDependencyRef(option.name)), option);
                },
                inject: [optionalSharedConfigHolder],
            },
        ];
    });
    return common_1.flatten(providers);
}
exports.createQueueOptionProviders = createQueueOptionProviders;
function createQueueProviders(options) {
    return options.map((option) => ({
        provide: utils_1.getQueueToken(option.name),
        useFactory: (o) => {
            const queueName = o.name || option.name;
            return buildQueue(Object.assign(Object.assign({}, o), { name: queueName }));
        },
        inject: [utils_1.getQueueOptionsToken(option.name)],
    }));
}
exports.createQueueProviders = createQueueProviders;
