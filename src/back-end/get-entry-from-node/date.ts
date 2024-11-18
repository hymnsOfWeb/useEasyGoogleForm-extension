import { getData } from "src/back-end/getters/get-data";
import { EntryFromNode } from "src/back-end/types";

export const getDateEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElems, question } = getData(node, true);
    const dateParts = [];
    let entry = "";
    for (const inputElem of inputElems) {
      const nameEntry = inputElem?.attribs?.name ?? "";
      if (nameEntry.includes("year")) {
        dateParts.push("year");
        entry = nameEntry.replace(/_year/gm, "");
      }
      if (nameEntry.includes("month")) {
        dateParts.push("month");
        entry = nameEntry.replace(/_month/gm, "");
      }
      if (nameEntry.includes("day")) {
        dateParts.push("day");
        entry = nameEntry.replace(/_day/gm, "");
      }
    }
    return {
      type: "date",
      entry,
      question,
      dateParts: Array.from(new Set(dateParts))
    };
  } catch {
    return null;
  }
};
