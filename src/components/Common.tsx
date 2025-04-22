import { LucideX } from "lucide-react";

export function roundAndPad(input: number) {
  return ("0" + Math.round(input >= 100 ? 99 : input)).slice(-2);
}
export const insertBetween = (array: Array<any>, ele: object) => {
  return array.flatMap((x) => [ele, x]).slice(1);
};

export function Separator() {
  return <LucideX className="stroke-primary mx-1 stroke-3" size={12} />;
}

export function bulkReplace(str: string, obj: { [key: string]: string }) {
  for (const x in obj) {
    str = str.replace(new RegExp(x, "g"), obj[x]);
  }
  return str;
}
