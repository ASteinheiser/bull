"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var BullModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const bull_metadata_accessor_1 = require("./bull-metadata.accessor");
const bull_explorer_1 = require("./bull.explorer");
const bull_providers_1 = require("./bull.providers");
const create_conditional_dep_holder_helper_1 = require("./helpers/create-conditional-dep-holder.helper");
const utils_1 = require("./utils");
const get_queue_options_token_util_1 = require("./utils/get-queue-options-token.util");
let BullModule = BullModule_1 = class BullModule {
    static forRoot(keyOrConfig, bullConfig) {
        const [configKey, sharedBullConfig] = typeof keyOrConfig === 'string'
            ? [keyOrConfig, bullConfig]
            : [undefined, keyOrConfig];
        const sharedBullConfigProvider = {
            provide: utils_1.getSharedConfigToken(configKey),
            useValue: sharedBullConfig,
        };
        return {
            global: true,
            module: BullModule_1,
            providers: [sharedBullConfigProvider],
            exports: [sharedBullConfigProvider],
        };
    }
    static forRootAsync(keyOrAsyncConfig, asyncBullConfig) {
        const [configKey, asyncSharedBullConfig] = typeof keyOrAsyncConfig === 'string'
            ? [keyOrAsyncConfig, asyncBullConfig]
            : [undefined, keyOrAsyncConfig];
        const imports = this.getUniqImports([asyncSharedBullConfig]);
        const providers = this.createAsyncSharedConfigurationProviders(configKey, asyncSharedBullConfig);
        return {
            global: true,
            module: BullModule_1,
            imports,
            providers,
            exports: providers,
        };
    }
    static registerQueue(...options) {
        const queueProviders = bull_providers_1.createQueueProviders([].concat(options));
        const queueOptionProviders = bull_providers_1.createQueueOptionProviders([].concat(options));
        return {
            module: BullModule_1,
            imports: [BullModule_1.registerCore()],
            providers: [...queueOptionProviders, ...queueProviders],
            exports: queueProviders,
        };
    }
    static registerQueueAsync(...options) {
        const optionsArr = [].concat(options);
        const queueProviders = bull_providers_1.createQueueProviders(optionsArr);
        const imports = this.getUniqImports(optionsArr);
        const asyncQueueOptionsProviders = options
            .map((queueOptions) => this.createAsyncProviders(queueOptions))
            .reduce((a, b) => a.concat(b), []);
        return {
            imports: imports.concat(BullModule_1.registerCore()),
            module: BullModule_1,
            providers: [...asyncQueueOptionsProviders, ...queueProviders],
            exports: queueProviders,
        };
    }
    static createAsyncProviders(options) {
        const optionalSharedConfigHolder = create_conditional_dep_holder_helper_1.createConditionalDepHolder(utils_1.getSharedConfigToken(options.configKey));
        if (options.useExisting || options.useFactory) {
            return [
                optionalSharedConfigHolder,
                this.createAsyncOptionsProvider(options, optionalSharedConfigHolder),
            ];
        }
        if (!options.useClass) {
            return bull_providers_1.createQueueOptionProviders([options]);
        }
        const useClass = options.useClass;
        return [
            optionalSharedConfigHolder,
            this.createAsyncOptionsProvider(options, optionalSharedConfigHolder),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(asyncOptions, optionalSharedConfigHolderRef) {
        if (asyncOptions.useFactory) {
            return {
                provide: get_queue_options_token_util_1.getQueueOptionsToken(asyncOptions.name),
                useFactory: (optionalDepHolder, ...factoryArgs) => __awaiter(this, void 0, void 0, function* () {
                    return Object.assign(Object.assign({}, optionalDepHolder.getDependencyRef(asyncOptions.name)), (yield asyncOptions.useFactory(...factoryArgs)));
                }),
                inject: [optionalSharedConfigHolderRef, ...(asyncOptions.inject || [])],
            };
        }
        const inject = [
            (asyncOptions.useClass ||
                asyncOptions.useExisting),
        ];
        return {
            provide: get_queue_options_token_util_1.getQueueOptionsToken(asyncOptions.name),
            useFactory: (optionalDepHolder, optionsFactory) => __awaiter(this, void 0, void 0, function* () {
                return Object.assign(Object.assign({}, optionalDepHolder.getDependencyRef(asyncOptions.name)), (yield optionsFactory.createBullOptions()));
            }),
            inject: [optionalSharedConfigHolderRef, ...inject],
        };
    }
    static createAsyncSharedConfigurationProviders(configKey, options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncSharedConfigurationProvider(configKey, options)];
        }
        const useClass = options.useClass;
        return [
            this.createAsyncSharedConfigurationProvider(configKey, options),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncSharedConfigurationProvider(configKey, options) {
        if (options.useFactory) {
            return {
                provide: utils_1.getSharedConfigToken(configKey),
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        const inject = [
            (options.useClass ||
                options.useExisting),
        ];
        return {
            provide: utils_1.getSharedConfigToken(configKey),
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return optionsFactory.createSharedConfiguration(); }),
            inject,
        };
    }
    static registerCore() {
        return {
            global: true,
            module: BullModule_1,
            imports: [core_1.DiscoveryModule],
            providers: [bull_explorer_1.BullExplorer, bull_metadata_accessor_1.BullMetadataAccessor],
        };
    }
    static getUniqImports(options) {
        return (options
            .map((option) => option.imports)
            .reduce((acc, i) => acc.concat(i || []), [])
            .filter((v, i, a) => a.indexOf(v) === i) || []);
    }
};
BullModule = BullModule_1 = __decorate([
    common_1.Module({})
], BullModule);
exports.BullModule = BullModule;
