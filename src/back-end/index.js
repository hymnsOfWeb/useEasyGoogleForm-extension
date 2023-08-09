"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const htmlparser2_1 = require("htmlparser2");
const main_str_1 = __importDefault(require("./main-str"));
const parse = new htmlparser2_1.Parser({
    onopentag(name, attribs) {
        var _a;
        if (name === "input" && ((_a = attribs === null || attribs === void 0 ? void 0 : attribs.name) !== null && _a !== void 0 ? _a : "").includes("entry.")) {
            console.log(attribs.name);
        }
    }
});
parse.write(main_str_1.default);
parse.end();
//# sourceMappingURL=index.js.map