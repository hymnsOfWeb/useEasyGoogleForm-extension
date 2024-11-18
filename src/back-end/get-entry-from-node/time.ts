import { getData } from "src/back-end/getters/get-data";
import { EntryFromNode } from "src/back-end/types";

export const getTimeEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElems, question } = getData(node, true);
    let entry = "";
    const timeParts = [];
    for (const inputElem of inputElems) {
      const nameEntry = inputElem?.attribs?.name ?? "";
      if (nameEntry.includes("hour")) {
        entry = nameEntry.replace(/_hour/gm, "");
        timeParts.push("hour");
      }
      if (nameEntry.includes("minute")) {
        entry = nameEntry.replace(/_minute/gm, "");
        timeParts.push("minute");
      }
      if (nameEntry.includes("second")) {
        entry = nameEntry.replace(/_second/gm, "");
        timeParts.push("second");
      }
    }
    return {
      type: "time",
      entry: entry,
      question: question,
      timeParts: Array.from(new Set(timeParts))
    };
  } catch {
    return null;
  }
};
