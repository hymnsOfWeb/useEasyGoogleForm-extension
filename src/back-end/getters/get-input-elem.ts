import { findOne } from "domutils";
import { DOMHandlerElement } from "src/back-end/types";

export const getInputElem = (
  node: DOMHandlerElement
): DOMHandlerElement | null => {
  const textInputElem = findOne(
    (elem) => elem?.name === "input" || elem?.name === "textarea",
    node?.childNodes
  );

  return textInputElem ?? null;
};
