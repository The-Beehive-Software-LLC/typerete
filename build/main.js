"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interpreter_1 = require("./interpreter");
const fname = "productions.ops";
const lines = (0, interpreter_1.readConfig)(fname);
console.log(lines);
