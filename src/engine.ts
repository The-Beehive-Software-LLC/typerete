// from interpreter import build_production, process_line
// from rete.alpha import *
// from rete.beta import *
// from rete.root import *
// from rete.rule import *
// from rete.type import *
// from strategy import recency



// class Engine:
//     def __init__(self, root=None, resolver=None):
//         """@param root: A pre-built network.
//         @param resolver: A conflict resolution function which accepts a set of rules and returns a single selected rule."""
//         self.resolver = resolver or recency
//         self.root = root or RootNode()
//         self.working_memory = []
//         self.current_token_id = 0
//         self.betas = []
//         self.rules = []

//     def resolve(self, conflict_set):
//         if len(conflict_set) == 0:
//             return {"type": "log", "data": {"message": "no applicable rule found"}}
//         if len(conflict_set) == 1:
//             return conflict_set[0]

//         return self.resolver(conflict_set)

//     def run(self):
//         """
//         Runs the engine according to the Match-Select-Execute algorithm:
//         ```
//         repeat
//             perform a match between working memory and production memory
//             exit if any of the following are true:
//                 conflict set is empty
//                 a halt was performed
//                 the cycle count has been reached
//                 a breakpoint has been reached
//             perform conflict resolution via given strategy
//             fire selected rule
//         end
//         ```
//         """

//         def eval(fact):
//             # TODO: Remove print
//             print("Evaluating:", fact)
//             result = self.root.eval(fact)
//             if not result == []:
//                 additional = result[-1]["action"]()
//                 return eval(additional)

//             return None

//         for fact in self.working_memory:
//             eval(fact)

//     def add_fact(self, token):
//         token["id"] = self.current_token_id
//         self.working_memory.append(token)
//         self.current_token_id += 1

//     def add_production(self, prod):
//         tokens = process_line(prod)[0]
//         prod_name, lhs, rhs = build_production(tokens)
//         AB = AlphaBuilder()
//         RB = RuleBuilder()

//         alphas = []
//         for cond in lhs:
//             name = cond[0]
//             typeNode = self.root.get_or_create(name)
//             node = AB.build_alpha(cond)

//             typeNode.add_child(node)

//             alphas.append(node)

//         beta = BetaNode(alphas)

//         for rule in rhs:
//             ruleNode = RB.build_rule(rule, prod_name)
//             beta.children.append(ruleNode)
//             self.rules.append(ruleNode)

//         self.betas.append(beta)

//     def find_node(self, node_id):
//         """Recursively searches the network to find the node with the given id.
//         Returns None if no matching node is found."""

//         def find(node):
//             # check self
//             if node.id == node_id:
//                 return node

//             # RuleNodes have no children
//             if type(node) == RuleNode:
//                 return

//             # Check each child
//             for child in node.get_children():
//                 res = find(child)
//                 if res:
//                     return res
//             return None

//         return find(self.root)

//     def get_all_nodes(self, nodeType):
//         res = []
//         for i in range(IDNode.current_id):
//             node = self.find_node(i)
//             if type(node) == nodeType:
//                 res.append(node)
//         return res

//     def __repr__(self):
//         result = f""
//         for typenode in self.root.children.values():
//             result += f"{typenode}\n"
//             for alpha in typenode.children:
//                 result += f"\t{alpha}\n"
//                 for beta in alpha.children:
//                     result += f"\t\t{beta}\n"
//                     for rule in beta.children:
//                         result += f"\t\t\t{rule}\n"
//         return result