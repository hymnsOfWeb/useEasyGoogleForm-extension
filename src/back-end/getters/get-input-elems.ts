import { findAll } from "domutils";
import { DOMHandlerElement } from "src/back-end/types";

export const getInputElems = (
  node: DOMHandlerElement
): DOMHandlerElement[] | null => {
  const inputElems = findAll((elem) => {
    return elem?.name === "input" && elem.attribs?.type === "hidden";
  }, node?.childNodes);
  if (!inputElems) return null;
  return inputElems;
};
