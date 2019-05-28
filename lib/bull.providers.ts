import * as Bull from 'bull';
import { Queue } from 'bull';
import { BullModuleOptions, BullModuleAsyncOptions } from './bull.interfaces';
import {
  BullQueueProcessor,
  isAdvancedProcessor,
  isAdvancedSeparateProcessor,
  isSeparateProcessor,
  isProcessorCallback,
} from './bull.types';
import { getQueueToken, getQueueOptionsToken } from './bull.utils';
import { Provider } from '@nestjs/common';

function buildQueue(option: BullModuleOptions): Queue {
  const queue: Queue = new Bull(
    option.name ? option.name : 'default',
    option.options,
  );
  if (option.processors) {
    option.processors.forEach((processor: BullQueueProcessor) => {
      let args = [];
      if (isAdvancedProcessor(processor)) {
        args.push(processor.name, processor.concurrency, processor.callback);
      } else if (isAdvancedSeparateProcessor(processor)) {
        args.push(processor.name, processor.concurrency, processor.path);
      } else if (
        isSeparateProcessor(processor) ||
        isProcessorCallback(processor)
      ) {
        args.push(processor);
      }
      args = args.filter(arg => !!arg);
      (queue.process as any)(...args);
    });
  }
  return queue;
}

export function createQueueOptionProviders(options: BullModuleOptions[]): any {
  return options.map(option => ({
    provide: getQueueOptionsToken(option.name),
    useValue: option,
  }));
}

export function createQueueProviders(options: BullModuleOptions[]): any {
  return options.map(option => ({
    provide: getQueueToken(option.name),
    useFactory: o => buildQueue(o),
    inject: [getQueueOptionsToken(option.name)],
  }));
}

export function createAsyncQueueOptionsProviders(
  options: BullModuleAsyncOptions[],
): Provider[] {
  return options.map(option => ({
    provide: getQueueOptionsToken(option.name),
    useFactory: option.useFactory,
    useClass: option.useClass,
    inject: option.inject,
  }));
}
