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

import * as fs from "fs"
import * as R from "ramda"
import { strip } from "./rete/utils"

type Accessor = {
  attr: string
  value: string
}
type Conditional = Accessor & {
  func: string
}
type Assignment = Accessor
type ProductionPartial<T extends Accessor> = {
  typename: string
  conditions: T[]
}
type Production = {
  name: string,
  LHS: ProductionPartial<Conditional>[]
  RHS: ProductionPartial<Assignment>[]
}

/**
 * @param token ^attr op value
 */
const parseConditional = (token: string): Conditional => {
  const [attr, func, value] = R.split(' ', token)
  return { attr, func, value }
}

/**
 * @param token ^attr value
 */
const parseAssignment = (token: string): Assignment => {
  const [attr, value] = R.split(' ', token)
  return { attr, value }
}

/**
 * @param token (typeName acc0 ... accN)
 */
const parseProductionPartial = <T extends Accessor>(token: string): ProductionPartial<T>[] => {
  const tokens = R.split(' ', strip(token, '()'))
  return {
    typeName: tokens[0],
    conditions: R.map<string, T>((item))
  }
}

export const readConfig = (fname: string): string[] => {
  return R.pipe(
    R.split('\n'),
    R.reject<string>((line) => R.isEmpty(line) || line[0] === "#")
  )(fs.readFileSync(fname, {
    encoding: "utf8"
  }))
}