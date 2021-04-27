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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConditionalDepHolder = void 0;
const common_1 = require("@nestjs/common");
const missing_shared_bull_config_error_1 = require("../errors/missing-shared-bull-config.error");
const utils_1 = require("../utils");
function createConditionalDepHolder(depToken, optionalDep = utils_1.BULL_CONFIG_DEFAULT_TOKEN, errorFactory = (caller) => new missing_shared_bull_config_error_1.MissingBullSharedConfigurationError(depToken, caller)) {
    let ConditionalDepHolder = class ConditionalDepHolder {
        constructor(_dependencyRef) {
            this._dependencyRef = _dependencyRef;
        }
        getDependencyRef(caller) {
            if (depToken !== optionalDep && !this._dependencyRef) {
                throw errorFactory(caller);
            }
            return this._dependencyRef;
        }
    };
    ConditionalDepHolder = __decorate([
        __param(0, common_1.Optional()), __param(0, common_1.Inject(depToken)),
        __metadata("design:paramtypes", [Object])
    ], ConditionalDepHolder);
    return common_1.mixin(ConditionalDepHolder);
}
exports.createConditionalDepHolder = createConditionalDepHolder;
