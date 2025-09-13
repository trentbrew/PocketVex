/**
 * PocketVex Rules Helper
 * Small utility to compose PocketBase API rules (filter strings).
 *
 * Notes:
 * - Return empty string ('') for open/public access; PocketVex converts '' to null for PB.
 * - Return '1=2' to deny all access.
 * - Combine helpers with and()/or()/not() for readability.
 */

export type Rule = string | undefined;

const paren = (s: string) => `(${s})`;

const join = (ops: Rule[], op: '&&' | '||') =>
  ops
    .filter((r): r is string => typeof r === 'string' && r.length >= 0)
    .map((s) => paren(s))
    .join(` ${op} `);

export const allow = {
  // Open access for anyone (public)
  // Use a constant-true expression compatible with PocketBase filter grammar.
  public: (): Rule => '1=1',
  // Deny all access
  deny: (): Rule => '1=2',
  // Any authenticated user
  auth: (): Rule => '@request.auth.id != ""',
  // Match a specific role on the auth record (default field 'role')
  role: (name: string, field = 'role'): Rule => `@request.auth.${field} = "${name}"`,
  // Match any of several roles
  anyRole: (names: string[], field = 'role'): Rule =>
    join(names.map((n) => allow.role(n, field)), '||'),
  // Owner by direct field (e.g., 'author', 'user')
  owner: (field: string): Rule => `${field} = @request.auth.id`,
  // Owner through a relation chain (e.g., 'module.course.author')
  relatedOwner: (relation: string, ownerField = 'author'): Rule =>
    `${relation}.${ownerField} = @request.auth.id`,
  // Boolean field gate for published visibility
  published: (field = 'isPublished'): Rule => `${field} = true`,
  // Combine with AND / OR / NOT
  and: (...rules: Rule[]): Rule => join(rules, '&&'),
  or: (...rules: Rule[]): Rule => join(rules, '||'),
  not: (rule: Rule): Rule => (rule ? `!(${rule})` : undefined),
};

export const pb = allow; // alias
