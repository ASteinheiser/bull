import { DynamicModule } from '@nestjs/common';
import * as Bull from 'bullmq';
import { SharedBullAsyncConfiguration } from './interfaces';
import { BullModuleAsyncOptions, BullModuleOptions } from './interfaces/bull-module-options.interface';
export declare class BullModule {
    static forRoot(bullConfig: Bull.QueueOptions): DynamicModule;
    static forRoot(configKey: string, bullConfig: Bull.QueueOptions): DynamicModule;
    static forRootAsync(asyncBullConfig: SharedBullAsyncConfiguration): DynamicModule;
    static forRootAsync(configKey: string, asyncBullConfig: SharedBullAsyncConfiguration): DynamicModule;
    static registerQueue(...options: BullModuleOptions[]): DynamicModule;
    static registerQueueAsync(...options: BullModuleAsyncOptions[]): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    private static createAsyncSharedConfigurationProviders;
    private static createAsyncSharedConfigurationProvider;
    private static registerCore;
    private static getUniqImports;
}
