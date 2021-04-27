"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectQueue = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../utils");
const InjectQueue = (name) => common_1.Inject(utils_1.getQueueToken(name));
exports.InjectQueue = InjectQueue;
