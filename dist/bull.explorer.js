"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullExplorer = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const injector_1 = require("@nestjs/core/injector/injector");
const metadata_scanner_1 = require("@nestjs/core/metadata-scanner");
const bullmq_1 = require("bullmq");
const bull_metadata_accessor_1 = require("./bull-metadata.accessor");
const bull_messages_1 = require("./bull.messages");
const utils_1 = require("./utils");
let BullExplorer = class BullExplorer {
    constructor(moduleRef, discoveryService, metadataAccessor, metadataScanner) {
        this.moduleRef = moduleRef;
        this.discoveryService = discoveryService;
        this.metadataAccessor = metadataAccessor;
        this.metadataScanner = metadataScanner;
        this.logger = new common_1.Logger('BullModule');
        this.injector = new injector_1.Injector();
    }
    onModuleInit() {
        this.explore();
    }
    explore() {
        const providers = this.discoveryService
            .getProviders()
            .filter((wrapper) => this.metadataAccessor.isQueueComponent(wrapper.metatype));
        providers.forEach((wrapper) => {
            const { instance, metatype } = wrapper;
            const isRequestScoped = !wrapper.isDependencyTreeStatic();
            const { name: queueName, } = this.metadataAccessor.getQueueComponentMetadata(metatype);
            const queueToken = utils_1.getQueueToken(queueName);
            const bullQueue = this.getQueue(queueToken, queueName);
            this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (key) => {
                if (this.metadataAccessor.isProcessor(instance[key])) {
                    const metadata = this.metadataAccessor.getProcessMetadata(instance[key]);
                    this.handleProcessor(instance, key, bullQueue, wrapper.host, isRequestScoped, metadata);
                }
                else if (this.metadataAccessor.isListener(instance[key])) {
                    const metadata = this.metadataAccessor.getListenerMetadata(instance[key]);
                    this.handleListener(instance, key, wrapper, bullQueue, metadata);
                }
            });
        });
    }
    getQueue(queueToken, queueName) {
        try {
            return this.moduleRef.get(queueToken, { strict: false });
        }
        catch (err) {
            this.logger.error(bull_messages_1.NO_QUEUE_FOUND(queueName));
            throw err;
        }
    }
    handleProcessor(instance, key, queue, moduleRef, isRequestScoped, options = {}) {
        let processor;
        if (isRequestScoped) {
            processor = (...args) => __awaiter(this, void 0, void 0, function* () {
                const contextId = core_1.createContextId();
                if (this.moduleRef.registerRequestByContextId) {
                    const jobRef = args[0];
                    this.moduleRef.registerRequestByContextId(jobRef, contextId);
                }
                const contextInstance = yield this.injector.loadPerContext(instance, moduleRef, moduleRef.providers, contextId);
                return contextInstance[key].call(contextInstance, ...args);
            });
        }
        else {
            processor = instance[key].bind(instance);
        }
        new bullmq_1.Worker(queue.name, processor, options);
    }
    handleListener(instance, key, wrapper, queue, options) {
        if (!wrapper.isDependencyTreeStatic()) {
            this.logger.warn(`Warning! "${wrapper.name}" class is request-scoped and it defines an event listener ("${wrapper.name}#${key}"). Since event listeners cannot be registered on scoped providers, this handler will be ignored.`);
            return;
        }
        if (options.name || options.id) {
            queue.on(options.eventName, (jobOrJobId, ...args) => __awaiter(this, void 0, void 0, function* () {
                const job = typeof jobOrJobId === 'string'
                    ? (yield queue.getJob(jobOrJobId)) || { name: false, id: false }
                    : jobOrJobId;
                if (job.name === options.name || job.id === options.id) {
                    return instance[key].apply(instance, [job, ...args]);
                }
            }));
        }
        else {
            queue.on(options.eventName, instance[key].bind(instance));
        }
    }
};
BullExplorer = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        core_1.DiscoveryService,
        bull_metadata_accessor_1.BullMetadataAccessor,
        metadata_scanner_1.MetadataScanner])
], BullExplorer);
exports.BullExplorer = BullExplorer;
