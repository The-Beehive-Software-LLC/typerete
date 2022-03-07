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
exports.RuleBuilder = void 0;
const utils_1 = require("./utils");
const R = __importStar(require("ramda"));
const alpha_1 = require("./alpha");
class RuleNode extends utils_1.IDNode {
    constructor(action, stringRepr, name) {
        super();
        this.activationID = 0;
        this.action = action;
        this.stringRepr = stringRepr;
        this.name = name;
        this.mem = {};
    }
    /**
     * Saves a log of the fact in memory
     * and returns fireable rule
     *
     * Prevents duplicate firings
     */
    eval(fact, context) {
        if (!this.match(fact, context)) {
            return null;
        }
        const result = {
            activationID: this.getActicationID(),
            action: () => this.action(fact),
            fact,
        };
        this.save(result, this.getContextIDs(context));
        return result;
    }
    save(result, keys) {
        throw new Error("Method not implemented.");
    }
    getActicationID() {
        RuleNode.currentActivationID += 1;
        return RuleNode.currentActivationID - 1;
    }
    getContextIDs(context) {
        return R.map((key) => key, Object.keys(context));
    }
    match(fact, context) {
        const keys = this.getContextIDs(context);
        const key = (0, utils_1.joinMap)(',', (key) => key, keys);
        return key in this.mem;
    }
    repr() {
        return `<RuleNodeID:${this.id} ${this.stringRepr}>`;
    }
}
exports.default = RuleNode;
RuleNode.currentActivationID = 0;
class RuleBuilder {
    /**
     *
     * @param tokens A RHS list of strings in the form:
     * [typeName, getter_0, setter_0, ..., getter_n, setter_n]
     *
     * @example ['Ticket', '^startTime', 'now', '^compTime', ['compute', 'add', '^startTime', ['compute', 'max', '^orders.aLaMinuteDuration']]]
     * @param name
     */
    buildRule(tokens, name) {
        const stringRepr = this.buildRepr(tokens);
        const typeName = tokens[0];
        const components = this.separateComponents(R.drop(1, tokens));
        const actions = R.map(this.buildAction, components);
        /**
         * Selects a fact from a context and returns a fact modified based on the rule.
         * @param ctx A Record of id keys and fact values
         */
        const applyRule = (ctx) => {
            const fact = R.find((f) => f.type === typeName, Object.values(ctx));
            return fact && R.reduce((f, { attr, action }) => {
                return Object.assign(Object.assign({}, f), { data: Object.assign(Object.assign({}, f.data), { [`${R.drop(1, attr)}`]: action(f, ctx) }) });
            }, fact, actions);
        };
        return new RuleNode(applyRule, stringRepr, name);
    }
    buildAction(component) {
        const attr = component[0];
        const rest = component[1];
        const AB = new alpha_1.AlphaBuilder();
        const action = (fact, context, args) => {
            //base case, non-compute
            if (typeof args === "string") {
                let tempAttr = args;
                if (tempAttr.includes('^')) {
                    //Access value from fact
                    return AB.processGetter(attr).eval(fact);
                }
                if (tempAttr.includes('?')) {
                    //Access value from context
                    const path = R.drop(1, tempAttr);
                    const first = path.includes('.')
                        ? R.dropLast(path.indexOf('.'), path)
                        : path;
                    for (let item of Object.values(context)) {
                        if (Object.keys(item.data).includes(first)) {
                            return AB.processGetter(`^${path}`).eval(item);
                        }
                    }
                }
                if (tempAttr in RuleBuilder.supportedFunctions) {
                    return RuleBuilder.supportedFunctions[tempAttr]();
                }
                return (0, utils_1.isNumberSafe)(tempAttr) ? tempAttr : tempAttr;
            }
            //recursive case
            const f = RuleBuilder.supportedFunctions[args[1]];
            return f(...R.map((arg) => action(fact, context, arg), R.drop(2, args)));
        };
        return {
            attr,
            action: (fact, ctx) => action(fact, ctx, rest)
        };
    }
    separateComponents(tokens) {
        let components = [];
        let current = [tokens[0]];
        //append to components and reset current each time there's a top-level ^
        R.forEach((token) => {
            if (token[0] === "^") {
                const component = this.buildAction(current);
                components.push(component);
                current = [];
            }
            current.push(token);
        });
        //Push last one
        components.push(current);
        return components;
    }
    buildRepr(tokens) {
        return "";
    }
}
exports.RuleBuilder = RuleBuilder;
RuleBuilder.supportedFunctions = {
    "max": (items) => R.reduce((acc, item) => acc >= item ? acc : item, Number.MIN_SAFE_INTEGER, items),
    "min": (items) => R.reduce((acc, item) => acc <= item ? acc : item, Number.MAX_SAFE_INTEGER, items),
    "add": (a, b) => a + b,
    "mul": (a, b) => a * b,
    "sub": (a, b) => a - b,
    "div": (a, b) => a / b,
    "now": () => new Date().getTime()
};
//     def build_repr(self, tokens):
//         stringified = str(tokens).replace("[", "(").replace("]", ")")
//         filtered = filter(lambda c: not (c == "," or c == "'"), stringified)
//         return "".join([f for f in filtered])
