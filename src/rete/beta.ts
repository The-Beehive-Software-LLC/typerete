import { IDNode, ReteNode, Fact, Rule, BetaMem, joinMap } from "./utils"
import AlphaNode from "./alpha"
import * as R from "ramda"


/**
 * An N-Input Node which checks to see if all parents pass the check before evaluating children.
 */
export default class BetaNode extends IDNode implements ReteNode {
  parents: AlphaNode[]
  children: Rule[]
  mem: BetaMem[]

  constructor(parents: AlphaNode[]) {
    super()
    this.parents = parents
    this.children = []
    this.mem = []

    //@todo: Add self to parents' children
  }

  /**
   * Saves the most recent matching facts
   */
  save() {
    this.mem.push(R.reduce<AlphaNode, BetaMem>((acc, parent) => {
      acc[parent.id] = R.empty(parent.mem) ? null : parent.mem[parent.mem.length - 1]
      return acc
    }, {}, this.parents))
  }

  /**
   * Checks parents for matching memory items
   */
  match() {
    return R.reduceWhile<AlphaNode, boolean>(
      //Predicate checked at every iteration
      //Short circuits iteration if false
      (acc, elem) => acc,
      //parent0.check() && ... && parentN.check()
      (acc, elem) => acc && elem.check(),
      //Initial value
      true,
      //List to iterate over
      this.parents
    )
  }

  eval(fact: Fact) {
    if (this.match()) {
      this.save()

      // return R.reduce<Rule, Rule[]>((rules, child) => {
      //   rules.push(child)
      //   return rules
      // })
      return this.children
    }

    return []
  }

  //     def eq(self, other):
  //         # @NOTE: BetaNodes are not comparable?
  //         return False

  repr() {
    return `<BetaNode
      ID:${this.id}
      (${joinMap(',', c => c.id, this.parents)}) => [${joinMap(',', c => c.id, this.children)}]
    >`
  }
  //     def __repr__(self):
  //         return f"<BetaNode ID:{self.id} {[p.id for p in self.parents]} => {[c.id for c in self.children]}>"
}