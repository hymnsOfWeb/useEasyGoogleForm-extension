import { findOne } from "domutils";
import { DOMHandlerElement } from "src/back-end/types";

export const getQuestion = (node: DOMHandlerElement): string => {
  const spanElem = findOne((elem) => {
    return elem?.name === "span";
  }, node?.childNodes);

  const question = ((spanElem?.childNodes[0] as any)?.data as string) ?? "";
  return question;
};
