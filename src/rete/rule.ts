import { BetaMem, Fact, IDNode, isNumberSafe, joinMap } from "./utils"
import * as R from "ramda"
import { AlphaBuilder } from "./alpha"

export type Fireable = {
  activationID: number,
  action: () => void,
  fact: Fact
}
export default class RuleNode extends IDNode {
  static currentActivationID: number = 0
  activationID: number
  stringRepr: string
  name: string
  action: (fact: Fact) => void
  mem: Record<string, { item: Fireable, keys: number[] }>

  constructor(action: (fact: Fact) => void, stringRepr: string, name: string) {
    super()
    this.activationID = 0
    this.action = action
    this.stringRepr = stringRepr
    this.name = name
    this.mem = {}
  }

  /**
   * Saves a log of the fact in memory
   * and returns fireable rule
   * 
   * Prevents duplicate firings
   */
  eval(fact: Fact, context: BetaMem): Fireable | null {
    if (!this.match(fact, context)) {
      return null
    }

    const result: Fireable = {
      activationID: this.getActicationID(),
      action: () => this.action(fact),
      fact,
    }
    this.save(result, this.getContextIDs(context))
    return result
  }
  save(result: Fireable, keys: number[]) {
    throw new Error("Method not implemented.")
  }
  getActicationID(): number {
    RuleNode.currentActivationID += 1
    return RuleNode.currentActivationID - 1
  }
  getContextIDs(context: BetaMem): number[] {
    return R.map((key) => (key as unknown as number), Object.keys(context))
  }
  match(fact: Fact, context: BetaMem): boolean {
    const keys = this.getContextIDs(context);
    const key = joinMap(',', (key) => key, keys)

    return key in this.mem
  }
  repr(): string {
    return `<RuleNodeID:${this.id} ${this.stringRepr}>`
  }
}

export class RuleBuilder {
  static supportedFunctions: Record<string, any> = {
    "max": (items: number[]) => R.reduce((acc, item) => acc >= item ? acc : item, Number.MIN_SAFE_INTEGER, items),
    "min": (items: number[]) => R.reduce((acc, item) => acc <= item ? acc : item, Number.MAX_SAFE_INTEGER, items),
    "add": (a: number, b: number) => a + b,
    "mul": (a: number, b: number) => a * b,
    "sub": (a: number, b: number) => a - b,
    "div": (a: number, b: number) => a / b,
    "now": () => new Date().getTime()
  }

  /**
   * 
   * @param tokens A RHS list of strings in the form:
   * [typeName, getter_0, setter_0, ..., getter_n, setter_n]
   * 
   * @example ['Ticket', '^startTime', 'now', '^compTime', ['compute', 'add', '^startTime', ['compute', 'max', '^orders.aLaMinuteDuration']]]
   * @param name 
   */
  buildRule(tokens: string[], name: string) {
    const stringRepr = this.buildRepr(tokens)
    const typeName = tokens[0]
    const components = this.separateComponents(R.drop(1, tokens))
    const actions = R.map<
      any, { attr: string, action: (fact: Fact, ctx: Record<number, Fact>) => any }
    >(
      this.buildAction, components
    )

    /**
     * Selects a fact from a context and returns a fact modified based on the rule.
     * @param ctx A Record of id keys and fact values
     */
    const applyRule = (ctx: Record<number, Fact>) => {
      const fact = R.find<Fact>((f) => f.type === typeName, Object.values(ctx))

      return fact && R.reduce(
        (f, { attr, action }) => {
          return {
            ...f,
            data: {
              ...f.data,
              [`${R.drop(1, attr)}`]: action(f, ctx),
            }
          }
        },
        fact,
        actions
      )
    }

    return new RuleNode(applyRule, stringRepr, name)
  }

  buildAction(component: any): { attr: string, action: (fact: Fact, ctx: Record<number, Fact>) => any } {
    const attr = component[0]
    const rest = component[1]
    const AB = new AlphaBuilder()

    const action = (fact: Fact, context: Record<any, Fact>, args: string | string[]): any => {
      //base case, non-compute
      if (typeof args === "string") {
        let tempAttr = args
        if (tempAttr.includes('^')) {
          //Access value from fact
          return AB.processGetter(attr).eval(fact)
        }
        if (tempAttr.includes('?')) {
          //Access value from context
          const path = R.drop(1, tempAttr)
          const first = path.includes('.')
            ? R.dropLast(path.indexOf('.'), path)
            : path
          for (let item of Object.values(context)) {
            if (Object.keys(item.data).includes(first)) {
              return AB.processGetter(`^${path}`).eval(item)
            }
          }
        }

        if (tempAttr in RuleBuilder.supportedFunctions) {
          return RuleBuilder.supportedFunctions[tempAttr]()
        }

        return isNumberSafe(tempAttr) ? tempAttr as unknown as number : tempAttr
      }

      //recursive case
      const f = RuleBuilder.supportedFunctions[args[1]]
      return f(
        ...R.map<string, any>((arg) => action(fact, context, arg), R.drop(2, args))
      )
    }
    return {
      attr,
      action: (fact, ctx) => action(fact, ctx, rest)
    }
  }

  separateComponents(tokens: string[]): any[] {
    let components: any[] = []
    let current: string[] = [tokens[0]]

    //append to components and reset current each time there's a top-level ^
    R.forEach<string>((token) => {
      if (token[0] === "^") {
        const component = this.buildAction(current)
        components.push(component)
        current = []
      }

      current.push(token)
    })

    //Push last one
    components.push(current)
    return components
  }
  buildRepr(tokens: string[]): string {
    return ""
  }
}
//     def build_repr(self, tokens):
//         stringified = str(tokens).replace("[", "(").replace("]", ")")
//         filtered = filter(lambda c: not (c == "," or c == "'"), stringified)
//         return "".join([f for f in filtered])