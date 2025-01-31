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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullMetadataAccessor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const bull_constants_1 = require("./bull.constants");
let BullMetadataAccessor = class BullMetadataAccessor {
    constructor(reflector) {
        this.reflector = reflector;
    }
    isQueueComponent(target) {
        if (!target) {
            return false;
        }
        return !!this.reflector.get(bull_constants_1.BULL_MODULE_QUEUE, target);
    }
    isProcessor(target) {
        if (!target) {
            return false;
        }
        return !!this.reflector.get(bull_constants_1.BULL_MODULE_QUEUE_PROCESS, target);
    }
    isListener(target) {
        if (!target) {
            return false;
        }
        return !!this.reflector.get(bull_constants_1.BULL_MODULE_ON_QUEUE_EVENT, target);
    }
    getQueueComponentMetadata(target) {
        return this.reflector.get(bull_constants_1.BULL_MODULE_QUEUE, target);
    }
    getProcessMetadata(target) {
        return this.reflector.get(bull_constants_1.BULL_MODULE_QUEUE_PROCESS, target);
    }
    getListenerMetadata(target) {
        return this.reflector.get(bull_constants_1.BULL_MODULE_ON_QUEUE_EVENT, target);
    }
};
BullMetadataAccessor = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [core_1.Reflector])
], BullMetadataAccessor);
exports.BullMetadataAccessor = BullMetadataAccessor;
