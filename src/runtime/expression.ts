import type { GameState } from '../types/index.js';

export interface ExpressionResult {
  value: boolean;
  error?: string;
}

type TokenType = 'number' | 'string' | 'boolean' | 'identifier' | 'operator' | 'paren' | 'comma';

interface Token {
  type: TokenType;
  value: string;
}

type AstNode =
  | { kind: 'literal'; value: number | string | boolean | null }
  | { kind: 'identifier'; name: string }
  | { kind: 'unary'; op: '!'; operand: AstNode }
  | { kind: 'binary'; op: string; left: AstNode; right: AstNode }
  | { kind: 'call'; name: string; args: AstNode[] };

const OPERATORS = ['==', '!=', '>=', '<=', '>', '<', '&&', '||', '!'] as const;

function isAlpha(char: string): boolean {
  return /[A-Za-z_]/.test(char);
}

function isNumeric(char: string): boolean {
  return /[0-9]/.test(char);
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      i += 1;
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      i += 1;
      continue;
    }

    if (char === ',') {
      tokens.push({ type: 'comma', value: char });
      i += 1;
      continue;
    }

    const twoChar = expr.slice(i, i + 2);
    if (OPERATORS.includes(twoChar as (typeof OPERATORS)[number])) {
      tokens.push({ type: 'operator', value: twoChar });
      i += 2;
      continue;
    }

    if (OPERATORS.includes(char as (typeof OPERATORS)[number])) {
      tokens.push({ type: 'operator', value: char });
      i += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      i += 1;
      let value = '';
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === '\\' && i + 1 < expr.length) {
          value += expr[i + 1];
          i += 2;
        } else {
          value += expr[i];
          i += 1;
        }
      }
      if (expr[i] !== quote) {
        throw new Error('Unterminated string literal');
      }
      i += 1;
      tokens.push({ type: 'string', value });
      continue;
    }

    if (isNumeric(char) || (char === '.' && isNumeric(expr[i + 1] ?? ''))) {
      let value = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        value += expr[i];
        i += 1;
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    if (isAlpha(char)) {
      let value = '';
      while (i < expr.length && /[A-Za-z0-9_.]/.test(expr[i])) {
        value += expr[i];
        i += 1;
      }
      if (value === 'true' || value === 'false') {
        tokens.push({ type: 'boolean', value });
      } else {
        tokens.push({ type: 'identifier', value });
      }
      continue;
    }

    throw new Error(`Unexpected token: ${char}`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private position = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parseExpression(): AstNode {
    return this.parseOr();
  }

  private parseOr(): AstNode {
    let node = this.parseAnd();
    while (this.matchOperator('||')) {
      node = { kind: 'binary', op: '||', left: node, right: this.parseAnd() };
    }
    return node;
  }

  private parseAnd(): AstNode {
    let node = this.parseEquality();
    while (this.matchOperator('&&')) {
      node = { kind: 'binary', op: '&&', left: node, right: this.parseEquality() };
    }
    return node;
  }

  private parseEquality(): AstNode {
    let node = this.parseComparison();
    while (this.matchOperator('==') || this.matchOperator('!=')) {
      const operator = this.previous().value;
      node = { kind: 'binary', op: operator, left: node, right: this.parseComparison() };
    }
    return node;
  }

  private parseComparison(): AstNode {
    let node = this.parseUnary();
    while (
      this.matchOperator('>') ||
      this.matchOperator('>=') ||
      this.matchOperator('<') ||
      this.matchOperator('<=')
    ) {
      const operator = this.previous().value;
      node = { kind: 'binary', op: operator, left: node, right: this.parseUnary() };
    }
    return node;
  }

  private parseUnary(): AstNode {
    if (this.matchOperator('!')) {
      return { kind: 'unary', op: '!', operand: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): AstNode {
    if (this.match('number')) {
      return { kind: 'literal', value: Number(this.previous().value) };
    }
    if (this.match('string')) {
      return { kind: 'literal', value: this.previous().value };
    }
    if (this.match('boolean')) {
      return { kind: 'literal', value: this.previous().value === 'true' };
    }
    if (this.match('identifier')) {
      const name = this.previous().value;
      if (this.matchValue('paren', '(')) {
        const args: AstNode[] = [];
        if (!this.checkValue('paren', ')')) {
          do {
            args.push(this.parseExpression());
          } while (this.matchValue('comma', ','));
        }
        this.consumeValue('paren', ')', 'Expected closing parenthesis for function call');
        return { kind: 'call', name, args };
      }
      return { kind: 'identifier', name };
    }
    if (this.matchValue('paren', '(')) {
      const expr = this.parseExpression();
      this.consumeValue('paren', ')', 'Expected closing parenthesis');
      return expr;
    }

    throw new Error('Unexpected expression token');
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private matchOperator(value: string): boolean {
    if (this.checkValue('operator', value)) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private matchValue(type: TokenType, value: string): boolean {
    if (this.checkValue(type, value)) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkValue(type: TokenType, value: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === type && token.value === value;
  }

  private consumeValue(type: TokenType, value: string, message: string): void {
    if (this.checkValue(type, value)) {
      this.position += 1;
      return;
    }
    throw new Error(message);
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length;
  }
}

function resolveIdentifier(name: string, state: GameState): unknown {
  if (name.startsWith('flag.')) {
    const key = name.slice('flag.'.length);
    if (!key) {
      throw new Error('Invalid flag identifier');
    }
    return state.flags[key] ?? false;
  }
  if (name.startsWith('stat.')) {
    const key = name.slice('stat.'.length);
    if (!key) {
      throw new Error('Invalid stat identifier');
    }
    return state.character.stats[key] ?? 0;
  }
  if (name.startsWith('var.')) {
    const key = name.slice('var.'.length);
    if (!key) {
      throw new Error('Invalid var identifier');
    }
    return state.vars[key] ?? null;
  }
  if (name.startsWith('rep.')) {
    const key = name.slice('rep.'.length);
    if (!key) {
      throw new Error('Invalid rep identifier');
    }
    return state.reputation?.[key] ?? 0;
  }
  return null;
}

function callFunction(name: string, args: unknown[], state: GameState): unknown {
  if (name === 'hasItem') {
    const itemId = typeof args[0] === 'string' ? args[0] : '';
    return state.character.inventory.some((entry) => entry.item.id === itemId && entry.count > 0);
  }
  if (name === 'itemCount') {
    const itemId = typeof args[0] === 'string' ? args[0] : '';
    const entry = state.character.inventory.find((item) => item.item.id === itemId);
    return entry?.count ?? 0;
  }
  return null;
}

function evaluate(node: AstNode, state: GameState): unknown {
  switch (node.kind) {
    case 'literal':
      return node.value;
    case 'identifier':
      return resolveIdentifier(node.name, state);
    case 'call':
      return callFunction(
        node.name,
        node.args.map((arg) => evaluate(arg, state)),
        state
      );
    case 'unary':
      return !evaluate(node.operand, state);
    case 'binary': {
      const left = evaluate(node.left, state);
      const right = evaluate(node.right, state);
      switch (node.op) {
        case '&&':
          return Boolean(left) && Boolean(right);
        case '||':
          return Boolean(left) || Boolean(right);
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '>':
          return Number(left) > Number(right);
        case '>=':
          return Number(left) >= Number(right);
        case '<':
          return Number(left) < Number(right);
        case '<=':
          return Number(left) <= Number(right);
        default:
          return false;
      }
    }
    default:
      return false;
  }
}

function parseExpression(expr: string): AstNode {
  const tokens = tokenize(expr);
  if (tokens.length === 0) {
    throw new Error('Empty expression');
  }
  const parser = new Parser(tokens);
  return parser.parseExpression();
}

export function validateExpression(expr: string): { ok: boolean; error?: string } {
  try {
    const ast = parseExpression(expr);
    evaluate(ast, {
      version: '0.0.0',
      storyBundleId: 'validation',
      currentSceneId: 'validation',
      character: { name: 'Validator', stats: {}, inventory: [] },
      flags: {},
      vars: {},
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Expression validation failed';
    return { ok: false, error: message };
  }
}

export function evaluateExpression(expr: string, state: GameState): ExpressionResult {
  try {
    const ast = parseExpression(expr);
    return { value: Boolean(evaluate(ast, state)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Expression evaluation failed';
    return { value: false, error: message };
  }
}
