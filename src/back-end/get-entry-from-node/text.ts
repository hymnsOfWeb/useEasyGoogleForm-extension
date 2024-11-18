import { findOne } from "domutils";
import { nameAttribRegex } from "src/back-end/constants";
import { getData } from "src/back-end/getters/get-data";
import { EntryFromNode } from "src/back-end/types";

export const getTextEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElem } = getData(node);

    const textAreaElem = findOne((elem) => {
      return (
        elem?.name === "textarea" && nameAttribRegex.test(elem.attribs?.name)
      );
    }, node?.childNodes);

    if (inputElem) {
      return {
        type: "text",
        entry: inputElem?.attribs?.name ?? "",
        question: inputElem?.attribs["aria-label"] ?? ""
      };
    }

    if (textAreaElem) {
      return {
        type: "textarea",
        entry: textAreaElem?.attribs?.name ?? "",
        question: textAreaElem?.attribs["aria-label"] ?? ""
      };
    }

    return null;
  } catch {
    return null;
  }
};
