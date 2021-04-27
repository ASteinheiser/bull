"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process = void 0;
const common_1 = require("@nestjs/common");
const util_1 = require("util");
const bull_constants_1 = require("../bull.constants");
function Process(nameOrOptions) {
    const options = util_1.isString(nameOrOptions)
        ? { name: nameOrOptions }
        : nameOrOptions;
    return common_1.SetMetadata(bull_constants_1.BULL_MODULE_QUEUE_PROCESS, options || {});
}
exports.Process = Process;
