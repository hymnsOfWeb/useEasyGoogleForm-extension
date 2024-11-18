import { Parser, DomHandler } from "htmlparser2";
import { EntryType } from "./types";
import { findAll, findOne } from "domutils";
import {
  getDateEntryFromNode,
  getDropdownEntryFromNode,
  getMultiSelectEntryFromNode,
  getSingleSelectEntryFromNode,
  getTextEntryFromNode,
  getTimeEntryFromNode
} from "src/back-end/get-entry-from-node";
import { jsControllers } from "src/back-end/constants";

export const parserer = async (html: string) => {
  const entries: EntryType[] = [];

  const handler = new DomHandler((error, dom) => {
    if (error) {
      console.log("parsing error");
      return;
    }

    const questionContainers = findAll((elem) => {
      return (
        elem?.name === "div" &&
        elem?.attribs?.class === "Qr7Oae" &&
        elem.attribs.role === "listitem"
      );
    }, dom);

    for (const questionContainer of questionContainers) {
      const childDiv = findOne((elem) => {
        return elem?.name === "div";
      }, questionContainer.childNodes);

      const jscontroller = childDiv?.attribs?.jscontroller;

      let entry: EntryType | null = null;

      switch (jscontroller) {
        case jsControllers.TEXT:
          entry = getTextEntryFromNode(childDiv);
          break;
        case jsControllers.SINGLE_SELECT:
          entry = getSingleSelectEntryFromNode(childDiv);
          break;
        case jsControllers.MULTIPLE_SELECT:
          entry = getMultiSelectEntryFromNode(childDiv);
          break;
        case jsControllers.DATE:
          entry = getDateEntryFromNode(childDiv);
          break;
        case jsControllers.TIME:
          entry = getTimeEntryFromNode(childDiv);
          break;
        case jsControllers.DROPDOWN:
          entry = getDropdownEntryFromNode(childDiv);
          break;
      }

      if (entry) {
        entries.push(entry);
      }
    }
  });

  const parse = new Parser(handler);

  parse.write(html);

  parse.end();

  // console.log(JSON.stringify(entries, null, 4));
  return entries;
};
