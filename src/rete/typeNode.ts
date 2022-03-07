import { Fact, IDNode, joinMap, ReteNode, Rule } from "./utils"
import * as R from "ramda"

/**A simple Type Node that matches a fact if it has the given type.*/
export default class TypeNode extends IDNode implements ReteNode {
  type: string
  children: ReteNode[]

  constructor(type: string) {
    super()
    this.type = type
    this.children = []
  }
  match(fact: Fact) {
    //Returns True if the fact has the same type as the node.//
    return fact.type === this.type
  }
  eval(fact: Fact) {
    //If the fact matches, each child evaluates the fact.//
    if (this.match(fact)) {
      return R.reduce<ReteNode, Rule[]>((rules, child) => {
        rules.push(...child.eval(fact))
        return rules
      }, [], this.children)
    }

    return []
  }
  eq(type: string) {
    return this.type === type
  }
  add_child(child: ReteNode) {
    this.children.push(child)
  }
  get_children() {
    return this.children
  }
  repr() {
    return `<TypeNode 
      ID:${this.id} 
      Type:${this.type} => [${joinMap(',', child => child.id, this.children)}]
    >`
  }
}