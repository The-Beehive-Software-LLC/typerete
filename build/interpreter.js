"use strict";
// Interpreter rules:
// - Inspired by OPS5: http://www.cs.gordon.edu/local/courses/cs323/OPS5/ops5.html
// Productions:
//     (p <name> (<LHS_0>) (<LHS_1>) ... (<LHS_N>) => (<RHS_0>))
//     Notes:
//         - Always prefixed by a 'p' and a name string
//         - LHS and RHS always separated by '=>'
//         - Name strings may not have spaces
//         - May have any number of LHS conditions
//         - Recommended max 1 RHS rule
//     Examples:
//         "If a care has a flat tire, turn the engine off"
//         (p car-example (Car ^tires.status any = flat)=> (Car ^engine off))
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
exports.readConfig = exports.processLine = void 0;
// LHS Conditions:
//     (<typeName> ^<attr_0> <func_0> <value_0> ... ^<attr_n> <func_n> <value_n>)
//     Notes:
//         - Always prefixed by a typeName
//         - May have any number of attr + function + value trios
//         - A typeName may not have spaces
//         - Attrs must exist in the fact type.
//         - Functions must exist in AlphaNode's defaultOps, complexOps, or supportedFunctions
//     Examples:
//         (Car ^miles > 100000)
//         (Car ^tires.status all = inflated)
//         (Car ^engine.startTime = now())
// RHS Rules:
//     (<typeName> ^<attr_0> <value_0> ... ^<attr_n> <value_n>)
//     Notes:
//         - Always prefixed by a typeName
//         - May have any number of attr + value duos
//     Examples:
//         (Car ^engine.status running ^headlights on)
//         (Car ^speed (compute add ^speed 10))
//         (Car ^miles (compute add ^miles ?trip.distance))
// Attributes:
//     ^<attr>
//     Notes:
//         - Always prefixed by a '^'
//         - May be a complex attribute, denoted by a period-separated string
//         - Complex attributes access subattributes, aggregating where necessary
//         - List attributes should have at most one subattribute
//     Examples:
//         ^color
//         ^engine.status
// Context Attributes:
//     ?<attr>
//     Notes:
//         - Like an attribute, but accesses the token context rather than the token itself.
//     Examples:
//         ?trip.distance
//         ?weather.status
// Values:
//     <value>
//     Notes:
//         - May be any primitive (string, number, etc)
//         - May be an attribute (see Attributes)
//         - May be a context attribute, but only in RHS rules (see Context Attributes)
//         - May be a computed attribute (see Computed Values)
//     Examples:
//         red
//         100
//         ^status
//         ?distance
//         now()
//         (compute sub ^speed (compute sub ^speed ?speedlimit))
// Computed Values:
//     (compute <function> <arg_0> ... <arg_n>)
//     Notes:
//         - Always prefixed by a 'compute'
//         - Number of arguments must match arity of function
//         - Lazily computed for most accurate results
//         - Function must exist in RuleBuilder supported functions
//         - Args may be regular values, computed values, attributes, or context attributes
//     Examples:
//         (compute add 13 29)
//         (compute sub 50 12)
//         (compute add (compute sub 5 12) (compute mul 18 52))
// """
const fs = __importStar(require("fs"));
const R = __importStar(require("ramda"));
const utils_1 = require("./rete/utils");
/**
 * Breaks a line into token arrays
 * @example
 * >> process_line("Ticket ^status complete")
 * ["Ticket", "^status", "=", "complete"]
 * >> process_line("Ticket ^status = (compute all ^orders.status complete)")
 * ["Ticket", "^status", ["compute", "all", "^orders.stats", "complete"]]
 */
const processLine = (line) => {
    let openGroups = 0;
    let tokens = [];
    let current = "";
    const chars = line[line.length - 1] === "\n" ? [...R.drop(1, line)] : [...line];
    R.forEach((char) => {
        current += char;
        openGroups += (char === "("
            ? 1
            : char === ')'
                ? -1
                : 0);
        if (char == ' ' && openGroups === 0 && current !== ' ') {
            //Curent is a complete token and needs no extra processing
            //add to tokens and reset current
            tokens.push((0, utils_1.strip)(current));
            current = '';
        }
        if (openGroups === 0 && char === ')') {
            //current is a complete token, but needs extra processing
            const trimmed = R.dropLast(1, R.drop(1, current));
            // tokens.push(processLine(strip(trimmed)))
        }
    }, chars);
    return [];
};
exports.processLine = processLine;
//         # current is a complete token, but needs extra processing
//         # process, add result to tokens, and reset current
//         if open_groups == 0 and char == ")":
//             # remove extra whitespace, opening and closing parens
//             trimmed = current.strip()[1:-1]
//             tokens.append(process_line(trimmed))
//             current = ""
//     # grab the last one and strip before adding
//     if current != "":
//         tokens.append(current.strip())
//     return tokens
// def build_production(tokens):
//     """Splits the tokens into a three-tuple with (name, LHS, RHS).
//     Raises an AssertError if the tokens are not a valid production.
//     """
//     assert tokens[0] == "p" and "=>" in tokens
//     name = tokens[1]
//     edge = tokens.index("=>")
//     LHS = tokens[2:edge]
//     RHS = tokens[edge + 1 :]
//     return (name, LHS, RHS)
// def build_beta(alphas):
//     """From a list of alpha nodes, creates a Beta Node"""
//     return BetaNode(alphas)
const readConfig = (fname) => {
    return R.pipe(R.split('\n'), R.reject((line) => R.isEmpty(line) || line[0] === "#"))(fs.readFileSync(fname, {
        encoding: "utf8"
    }));
};
exports.readConfig = readConfig;
