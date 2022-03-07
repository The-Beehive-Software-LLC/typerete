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
exports.AlphaBuilder = void 0;
const utils_1 = require("./utils");
const R = __importStar(require("ramda"));
/**A Compound Node that matches multiple attributes on the same object.*/
class AlphaNode extends utils_1.IDNode {
    constructor(matches) {
        super();
        this.children = [];
        this.mem = [];
        this.matches = {};
        for (let match of matches) {
            this.matches[match.key.value] = match;
        }
    }
    match(fact) {
        //Returns true if all keys are present in the fact and all comparisons pass.//
        for (let { key, op, value } of R.values(this.matches)) {
            let fact_value = key.eval(fact);
            if (!op(fact_value, value())) {
                return false;
            }
        }
        return true;
    }
    check() {
        return !R.empty(this.mem) && this.match(this.mem[-1]);
    }
    eval(fact) {
        if (this.match(fact)) {
            this.mem.push(fact);
            return R.reduce((rules, child) => {
                rules.push(...child.eval(fact));
                return rules;
            }, [], this.children);
        }
        return [];
    }
    getChildren() {
        return this.children;
    }
    repr() {
        return `<AlphaNode 
      ID:${this.id}
      (${(0, utils_1.joinMap)(',', (match) => match.repr, Object.values(this.matches))})\
      => [${(0, utils_1.joinMap)(',', (child) => child.id, this.children)}]
    >`;
    }
}
exports.default = AlphaNode;
AlphaNode.defaultOps = {
    "=": (a, b) => a === b,
    "!=": (a, b) => a !== b,
    "<": (a, b) => a < b,
    ">": (a, b) => a > b,
    "<=": (a, b) => a <= b,
    ">=": (a, b) => a >= b,
};
AlphaNode.supportedFunctions = {};
class AlphaBuilder {
    // constructor() { }
    buildAlpha(tokens) {
        const typeName = tokens[0];
        //check for tautology
        if (R.empty(tokens)) {
            return this.buildTautology();
        }
        return R.pipe(R.drop(1), this.separateComponents, R.map(this.processComponent), (attrs) => new AlphaNode(attrs));
    }
    saveNode(typeName, tokens, node) {
        throw new Error("Not implemented yet.");
    }
    // save_node(typeName, facts, node){
    //   typeMem = this.mem.setdefault(typeName, [])
    //   typeMem[set(facts)] = node
    /**
     * Builds an AlphaMatch from the provided information
     * @param component A string[] in the form:
     * [getter, comp_0, ..., comp_n, value]
     */
    processComponent(component) {
        //   string_repr = " ".join(component)
        //   getter = this.process_getter(component[0])
        //   op = this.process_operator(component[1{- 1])
        //   value = this.process_value(component[-1])
        return {
            repr: R.join(' ', component),
            key: this.processGetter(component[0]),
            op: this.processOperator(R.dropLast(1, R.drop(1, component))),
            value: this.processValue(component[component.length - 1])
        };
    }
    /**
     * Returns a key object with a string value and a function to retrieve the key from a Fact
     * @example
     * Ex. ^status will access fact["status"]
     * Ex. ^orders.status will aggregate the status of each order.
     */
    processGetter(getter) {
        const lens_path = R.drop(1, getter).split('.');
        const complexLens = (token, path) => {
            if (R.empty(path)) {
                //base case
                return token;
            }
            //if token is a list, aggregate
            if (Array.isArray(token)) {
                return R.map((item) => complexLens(item, path), token);
            }
            //assumes token is a record
            return complexLens(token[path[0]], R.drop(1, path));
        };
        return {
            value: getter,
            eval: (fact) => complexLens(fact, lens_path)
        };
    }
    /**
     * Creates a boolean function from the defined operation
     * @param op
     */
    processOperator(op) {
        //@todo consider complex ops
        return AlphaNode.defaultOps[op[0]];
    }
    wrapValue(value) {
        if (typeof value === "function") {
            return value;
        }
        if ((0, utils_1.isNumberSafe)(value)) {
            let v = value;
            return () => v;
        }
        return () => value;
    }
    /**
     * Returns a function that provides a value
     */
    processValue(value) {
        return (value.indexOf('()') !== undefined || !(value in AlphaNode.supportedFunctions)
            ? this.wrapValue(value)
            : this.wrapValue(AlphaNode.supportedFunctions[value]));
    }
    /**
     * Separates a flat list of component information into separate lists
     * @param tokens A list of strings in the form:
     * [getter_0, comp_facts_0, value_0, ..., getter_n, comp_facts_n, value_n],
     * @type getter_0: A string beginning with a ^
     * @type comp_facts: A list of strings.
     * @type value: A string
     * @return A list of ?, where each pair is a list with a getter, comp facts, and a value.
     */
    separateComponents(tokens) {
        let components = [];
        //First one is always a getter
        let current = [tokens[0]];
        R.forEach((token) => {
            if (token[0] === '^') {
                //Current is complete, save and reset
                components.push(current);
                current = [];
            }
            current.push(token);
        }, tokens);
        return components;
    }
    buildTautology() {
        return new AlphaNode([
            {
                key: {
                    value: "",
                    eval: (fact) => true
                },
                op: (fact, baseline) => true,
                value: () => true,
                repr: ""
            }
        ]);
    }
}
exports.AlphaBuilder = AlphaBuilder;
