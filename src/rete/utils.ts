import * as R from "ramda"

export type Fact = {
  type: string
  data: Record<string, any>
}

export type BetaMem = Record<number, Fact | null>

export interface Rule extends IDNode {
  eval: (data: BetaMem[]) => any
}

export class IDNode {
  static currentID: number = 0
  id: number

  constructor() {
    this.id = IDNode.currentID
    IDNode.currentID += 1
  }
}

export interface ReteNode extends IDNode {
  match: (fact: Fact) => boolean
  eval: (fact: Fact) => Rule[]
  repr: () => string
  children: (ReteNode | Rule)[]
}

const makeString = (item: string | number) => typeof item === "string" ? item : `${item}`

/**
 * A composition of join and map
 * @param sepator The separator to join on
 * @param f The mapping function
 * @param items The items to map over
 * @returns A string of comma-separated mapped items
 */
export const joinMap = <T>(
  sepator: string, f: (item: T) => string | number, items: T[]
) => R.join(sepator, R.map<T, string>(R.compose(makeString, f), items))

/**
 * A safe version of isNumber
 * See: https://stackoverflow.com/questions/23437476/in-typescript-how-to-check-if-a-string-is-numeric
 */
export const isNumberSafe = (value: unknown) => {
  return Number.isInteger(Number(value)) && value !== null
}

/**
 * Removes the beginning and trailing characters from a string
 * @param stripChar The character to strip. Defaults to ' '. 
 */
export const strip = (str: string, stripChar: string = ' '): string => {
  const pred = (c:string) => stripChar.includes(c)
  return R.pipe<[s: string], string[], string[], string[], string>(
    //Convert to list of chars
    (s: string) => [...s],
    //Remove trailing stripChars on both sides
    R.dropWhile(pred),
    R.dropLastWhile(pred),
    //Recombine
    R.reduce((acc, elem) => acc + elem, '')
  )(str)
}