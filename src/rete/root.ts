import { ReteNode, Rule, IDNode, Fact, joinMap } from "./utils"
import * as R from "ramda"

export default class RootNode extends IDNode {
  children: ReteNode[]

  constructor() {
    super()
    this.children = []
  }

  eval(fact: Fact) {
    let result = []
    R.forEach<ReteNode>((child) => {
      result.push(...child.eval(fact))
    })
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
      ID:${this.id} => [${joinMap(',', c => c.id, this.children)}]
    >`
  }
}