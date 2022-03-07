import { readConfig } from "./interpreter";

const fname = "productions.ops"
const lines = readConfig(fname)

console.log(lines)