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
exports.strip = exports.isNumberSafe = exports.joinMap = exports.IDNode = void 0;
const R = __importStar(require("ramda"));
class IDNode {
    constructor() {
        this.id = IDNode.currentID;
        IDNode.currentID += 1;
    }
}
exports.IDNode = IDNode;
IDNode.currentID = 0;
const makeString = (item) => typeof item === "string" ? item : `${item}`;
/**
 * A composition of join and map
 * @param sepator The separator to join on
 * @param f The mapping function
 * @param items The items to map over
 * @returns A string of comma-separated mapped items
 */
const joinMap = (sepator, f, items) => R.join(sepator, R.map(R.compose(makeString, f), items));
exports.joinMap = joinMap;
/**
 * A safe version of isNumber
 * See: https://stackoverflow.com/questions/23437476/in-typescript-how-to-check-if-a-string-is-numeric
 */
const isNumberSafe = (value) => {
    return Number.isInteger(Number(value)) && value !== null;
};
exports.isNumberSafe = isNumberSafe;
/**
 * Removes the beginning and trailing characters from a string
 * @param stripChar The character to strip. Defaults to ' '.
 */
const strip = (str, stripChar = ' ') => {
    const pred = (c) => c === stripChar;
    return R.pipe(
    //Convert to list of chars
    (s) => [...s], 
    //Remove trailing stripChars on both sides
    R.dropWhile(pred), R.dropLastWhile(pred), 
    //Recombine
    R.reduce((acc, elem) => acc + elem, ''))(str);
};
exports.strip = strip;
