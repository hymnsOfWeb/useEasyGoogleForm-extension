import { Element as DOMHandlerElement } from "domhandler";

export interface EntryType {
  type:
    | "text"
    | "radio"
    | "textarea"
    | "checkbox"
    | "date"
    | "dropdown"
    | "time";
  entry: string;
  question?: string;
  values?: { text: string; value: string }[];
  dateParts?: ("year" | "month" | "day")[];
  timeParts?: ("hour" | "minute" | "second")[];
}

export type EntryFromNode = (node: DOMHandlerElement) => EntryType | null;

export { Element as DOMHandlerElement } from "domhandler";
