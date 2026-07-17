/**
 * Class-name joiner. This project isn't on shadcn/ui, so rather than pull
 * in clsx + tailwind-merge for a single component, `cn` just drops falsy
 * values and joins the rest. Callers here never pass conflicting Tailwind
 * utilities that would need merge-resolution.
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}
