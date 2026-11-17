// Aturan validasi per field, dipakai bersama oleh POST dan PATCH.
export type FieldRule = {
  valid: (value: unknown) => boolean;
  message: string;
  normalize?: (value: unknown) => unknown;
};
export type FieldRules = Record<string, FieldRule>;

/** Mengembalikan pesan error pertama, atau null jika body valid. */
export function validateBody(
  body: Record<string, unknown>,
  rules: FieldRules,
  emptyMessage: string
): string | null {
  const keys = Object.keys(body);
  if (keys.length === 0 || keys.some((key) => !Object.hasOwn(rules, key))) return emptyMessage;
  for (const key of keys) {
    if (!rules[key].valid(body[key])) return rules[key].message;
  }
  return null;
}

/** Merapikan nilai (trim, kosong menjadi null, hash password, dst.). */
export function normalizeBody(
  body: Record<string, unknown>,
  rules: FieldRules,
  keys: string[]
): Record<string, unknown> {
  return Object.fromEntries(
    keys.map((key) => [key, rules[key].normalize ? rules[key].normalize(body[key]) : body[key]])
  );
}
