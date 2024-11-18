import { findAll, findOne } from "domutils";
import { getData } from "src/back-end/getters/get-data";
import { EntryFromNode, EntryType } from "src/back-end/types";

export const getSingleSelectEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElem, question } = getData(node);
    const nameEntry = inputElem?.attribs?.name ?? "";
    const allLabels = findAll((elem) => {
      return (
        elem?.name === "label" &&
        elem.attribs?.class?.includes?.("docssharedWizToggleLabeledContainer")
      );
    }, node?.childNodes);
    const values: EntryType["values"] = [];
    for (const label of allLabels) {
      const forAttrib = label.attribs?.for;
      const elem = findOne((elem) => {
        return elem?.name === "div" && elem.attribs?.id === forAttrib;
      }, label?.childNodes);
      values.push({
        text: elem?.attribs["aria-label"] ?? "",
        value: elem?.attribs["data-value"] ?? elem?.attribs["aria-label"] ?? ""
      });
    }
    return {
      type: "radio",
      entry: nameEntry,
      question: question,
      values: values
    };
  } catch {
    return null;
  }
};
