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
/**
 * An N-Input Node which checks to see if all parents pass the check before evaluating children.
 */
class BetaNode extends utils_1.IDNode {
    constructor(parents) {
        super();
        this.parents = parents;
        this.children = [];
        this.mem = [];
        //@todo: Add self to parents' children
    }
    /**
     * Saves the most recent matching facts
     */
    save() {
        this.mem.push(R.reduce((acc, parent) => {
            acc[parent.id] = R.empty(parent.mem) ? null : parent.mem[parent.mem.length - 1];
            return acc;
        }, {}, this.parents));
    }
    /**
     * Checks parents for matching memory items
     */
    match() {
        return R.reduceWhile(
        //Predicate checked at every iteration
        //Short circuits iteration if false
        (acc, elem) => acc, 
        //parent0.check() && ... && parentN.check()
        (acc, elem) => acc && elem.check(), 
        //Initial value
        true, 
        //List to iterate over
        this.parents);
    }
    eval(fact) {
        if (this.match()) {
            this.save();
            // return R.reduce<Rule, Rule[]>((rules, child) => {
            //   rules.push(child)
            //   return rules
            // })
            return this.children;
        }
        return [];
    }
    //     def eq(self, other):
    //         # @NOTE: BetaNodes are not comparable?
    //         return False
    repr() {
        return `<BetaNode
      ID:${this.id}
      (${(0, utils_1.joinMap)(',', c => c.id, this.parents)}) => [${(0, utils_1.joinMap)(',', c => c.id, this.children)}]
    >`;
    }
}
exports.default = BetaNode;
