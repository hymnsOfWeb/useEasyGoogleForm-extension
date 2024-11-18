import { getInputElem } from "src/back-end/getters/get-input-elem";
import { getInputElems } from "src/back-end/getters/get-input-elems";
import { getQuestion } from "src/back-end/getters/get-question";
import { DOMHandlerElement } from "src/back-end/types";

export const getData = (node: DOMHandlerElement, multiInputElems = false) => {
  const forReturn: {
    question: string;
    inputElem?: DOMHandlerElement | null;
    inputElems?: DOMHandlerElement[] | null;
  } = {} as any;

  forReturn.question = getQuestion(node);

  if (multiInputElems) {
    forReturn.inputElems = getInputElems(node);
  } else {
    forReturn.inputElem = getInputElem(node);
  }

  return forReturn;
};
