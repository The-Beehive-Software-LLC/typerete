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
class RootNode extends utils_1.IDNode {
    constructor() {
        super();
        this.children = [];
    }
    eval(fact) {
        let result = [];
        R.forEach((child) => {
            result.push(...child.eval(fact));
        });
    }
    //   def get_or_create(self, type):
    //       """Find a child of the given type. If none exists, creates one and adds to children."""
    //       if type in self.children:
    //           child = self.children[type]
    //       else:
    //           # no child found
    //           child = TypeNode(type)
    //           self.children[child.type] = child
    //       return child
    //   def get_children(self):
    //       return self.children.values()
    repr() {
        return `<RootNode
      ID:${this.id} => [${(0, utils_1.joinMap)(',', c => c.id, this.children)}]
    >`;
    }
}
exports.default = RootNode;
