"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const R = __importStar(require("ramda"));
/**A simple Type Node that matches a fact if it has the given type.*/
class TypeNode extends utils_1.IDNode {
    constructor(type) {
        super();
        this.type = type;
        this.children = [];
    }
    match(fact) {
        //Returns True if the fact has the same type as the node.//
        return fact.type === this.type;
    }
    eval(fact) {
        //If the fact matches, each child evaluates the fact.//
        if (this.match(fact)) {
            return R.reduce((rules, child) => {
                rules.push(...child.eval(fact));
                return rules;
            }, [], this.children);
        }
        return [];
    }
    eq(type) {
        return this.type === type;
    }
    add_child(child) {
        this.children.push(child);
    }
    get_children() {
        return this.children;
    }
    repr() {
        return `<TypeNode 
      ID:${this.id} 
      Type:${this.type} => [${(0, utils_1.joinMap)(',', child => child.id, this.children)}]
    >`;
    }
}
exports.default = TypeNode;
