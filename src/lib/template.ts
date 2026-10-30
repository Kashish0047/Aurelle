/** Fills `{placeholders}` in config strings: fill("Book {service}", { service: "Facial" }). */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
