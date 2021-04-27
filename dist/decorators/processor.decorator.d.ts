import { Scope } from '@nestjs/common';
export interface ProcessorOptions {
    name?: string;
    scope?: Scope;
}
export declare function Processor(): ClassDecorator;
export declare function Processor(queueName: string): ClassDecorator;
export declare function Processor(processorOptions: ProcessorOptions): ClassDecorator;
