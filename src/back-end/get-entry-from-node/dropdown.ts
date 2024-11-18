import { findAll, findOne } from "domutils";
import { getData } from "src/back-end/getters/get-data";
import { EntryFromNode, EntryType } from "src/back-end/types";

export const getDropdownEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElem, question } = getData(node);
    const entry = inputElem.attribs.name;
    const values: EntryType["values"] = [];
    const optionDivs = findAll((elem) => {
      return (
        elem?.name === "div" &&
        elem?.attribs?.role === "option" &&
        elem?.attribs["data-value"] !== undefined &&
        elem?.attribs["data-value"] !== ""
      );
    }, node?.childNodes);
    for (const optionDiv of optionDivs) {
      const spanElem = findOne((elem) => {
        return elem?.name === "span";
      }, optionDiv?.childNodes);
      values.push({
        text: (spanElem?.childNodes[0] as any)?.data ?? "",
        value: optionDiv?.attribs["data-value"] ?? ""
      });
    }
    return {
      type: "dropdown",
      entry: entry,
      question: question,
      values: values
    };
  } catch {
    return null;
  }
};
