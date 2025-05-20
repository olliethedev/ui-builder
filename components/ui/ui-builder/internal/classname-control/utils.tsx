// Type guards for Tailwind class arrays
export function isTailwindClass<T extends readonly string[]>(
    arr: T,
    token: string
  ): token is T[number] {
    return arr.includes(token as any);
  }