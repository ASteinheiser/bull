import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common/interfaces';
import * as Bull from 'bullmq';
export interface SharedBullConfigurationFactory {
    createSharedConfiguration(): Promise<Bull.QueueOptions> | Bull.QueueOptions;
}
export interface SharedBullAsyncConfiguration extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<SharedBullConfigurationFactory>;
    useClass?: Type<SharedBullConfigurationFactory>;
    useFactory?: (...args: any[]) => Promise<Bull.QueueOptions> | Bull.QueueOptions;
    inject?: FactoryProvider['inject'];
}
