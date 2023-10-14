import { findAll, findOne } from "domutils";
import { Parser, DomHandler } from "htmlparser2";
import { customAlphabet } from "nanoid/non-secure";
// import { myHTML } from "./html";
import { Element as DOMHandlerElement } from "domhandler";

interface EntryType {
  type: "text" | "radio" | "textarea" | "checkbox" | "date" | "dropdown" | "time";
  entry: string;
  question?: string;
  values?: { text: string; value: string }[];
  dateParts?: ("year" | "month" | "day")[];
  timeParts?: ("hour" | "minute" | "second")[];
}

const fetcherFunc = async (url: string) => {
  const fetchOne = await fetch(url);
  const text = await fetchOne.text();
  return text;
};

enum jsControllers {
  TEXT = "rDGJeb",
  MULTIPLE_SELECT = "hIYTQc",
  SINGLE_SELECT = "pkFYWb",
  DATE = "qDmeqc",
  TIME = "D7fEsb",
  LINEAR_SCALE = "snI0Yd",
  DROPDOWN = "jmDACb"
}
const nameAttribRegex = /entry\.\d+/gm;

type EntryFromNode = (node: DOMHandlerElement) => EntryType | null;
const getQuestion = (node: DOMHandlerElement): string => {
  const spanElem = findOne((elem) => {
    return elem?.name === "span";
  }, node?.childNodes);
  const question = ((spanElem?.childNodes[0] as any)?.data as string) ?? "";
  return question;
};
const getInputElem = (node: DOMHandlerElement): DOMHandlerElement | null => {
  const textInputElem = findOne((elem) => {
    return (
      ((elem?.name === "input" && elem.attribs?.type === "text") || elem?.name === "textarea") &&
      nameAttribRegex.test(elem.attribs?.name)
    );
  }, node?.childNodes);
  if (textInputElem) {
    return textInputElem;
  }
  const inputElem = findOne((elem) => {
    return elem?.name === "input" && elem.attribs?.type === "hidden";
  }, node?.childNodes);
  if (inputElem) {
    return inputElem;
  }
  return null;
};
const getInputElems = (node: DOMHandlerElement): DOMHandlerElement[] | null => {
  const inputElems = findAll((elem) => {
    return elem?.name === "input" && elem.attribs?.type === "hidden";
  }, node?.childNodes);
  if (!inputElems) return null;
  return inputElems;
};
const getData = (node: DOMHandlerElement, multiInputElems = false) => {
  const forReturn: { question: string; inputElem?: DOMHandlerElement | null; inputElems?: DOMHandlerElement[] | null } =
    {} as any;
  forReturn.question = getQuestion(node);
  if (multiInputElems) {
    forReturn.inputElems = getInputElems(node);
  } else {
    forReturn.inputElem = getInputElem(node);
  }
  return forReturn;
};
const getTextEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElem } = getData(node);
    const textAreaElem = findOne((elem) => {
      return elem?.name === "textarea" && nameAttribRegex.test(elem.attribs?.name);
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
const getSingleSelectEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElem, question } = getData(node);
    const nameEntry = inputElem?.attribs?.name ?? "";
    const allLabels = findAll((elem) => {
      return elem?.name === "label" && elem.attribs?.class?.includes?.("docssharedWizToggleLabeledContainer");
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
const getMultiSelectEntryFromNode: EntryFromNode = (node) => {
  try {
    const { inputElem, question } = getData(node);
    const nameEntry = (inputElem?.attribs?.name ?? "")?.replace(/_sentinel/gm, "");
    const allLabels = findAll((elem) => {
      return elem?.name === "label" && elem.attribs?.class?.includes?.("docssharedWizToggleLabeledContainer");
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
      type: "checkbox",
      entry: nameEntry,
      question: question,
      values: values
    };
  } catch {
    return null;
  }
};
const getDateEntryFromNode: EntryFromNode = (node) => {
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
const getTimeEntryFromNode: EntryFromNode = (node) => {
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
const getDropdownEntryFromNode: EntryFromNode = (node) => {
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

const parserer = async (html: string) => {
  const entries: EntryType[] = [];
  const handler = new DomHandler((error, dom) => {
    if (error) {
      console.log("parsing error");
    } else {
      const questionContainers = findAll((elem) => {
        return elem?.name === "div" && elem?.attribs?.class === "Qr7Oae" && elem.attribs.role === "listitem";
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
            if (entry) {
              entries.push(entry);
            }
            break;
          case jsControllers.SINGLE_SELECT:
            entry = getSingleSelectEntryFromNode(childDiv);
            if (entry) {
              entries.push(entry);
            }
            break;
          case jsControllers.MULTIPLE_SELECT:
            entry = getMultiSelectEntryFromNode(childDiv);
            if (entry) {
              entries.push(entry);
            }
            break;
          case jsControllers.DATE:
            entry = getDateEntryFromNode(childDiv);
            if (entry) {
              entries.push(entry);
            }
            break;
          case jsControllers.TIME:
            entry = getTimeEntryFromNode(childDiv);
            if (entry) {
              entries.push(entry);
            }
            break;
          case jsControllers.DROPDOWN:
            entry = getDropdownEntryFromNode(childDiv);
            if (entry) {
              entries.push(entry);
            }
            break;
        }
      }
    }
  });
  const parseTwo = new Parser(handler);
  parseTwo.write(html);
  parseTwo.end();
  // console.log(JSON.stringify(entries, null, 4));
  return entries;
};

const getPrefillUrl = async (url: string) => {
  const queryIndex = url.indexOf("?");
  if (queryIndex !== -1) {
    url = url.slice(0, queryIndex);
  }
  if (url.includes("/edit")) {
    url = url.replace("/edit", "");
  }
  if (url[url.length - 1] !== "/") {
    url += "/";
  }
  url += "prefill";
  return url;
};

const getGFid = async (url: string) => {
  const tempForIdOne = url.replace(/https:\/\/docs\.google\.com\/forms\/d(\/e)?\//gm, "");
  const gFromId = tempForIdOne.slice(0, tempForIdOne.indexOf("/"));
  return gFromId;
};

const createFinalString = async ({ gFromId, entries }: { gFromId: string; entries: EntryType[] }) => {
  const tabs = (n: number) => Array<string>(n).fill("\t").join("");
  const nanoId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz");
  const ids: string[] = [];

  let finalString = `
import { useRef } from "react";
import { useEasyGoogleForm } from "@hymns-of-web/use-easy-google-form";

export default function MyCustomGForm() {
${tabs(1)}const ref = useRef(null);
${tabs(1)}const onSubmit = useEasyGoogleForm({
${tabs(2)}formRef: ref,
${tabs(2)}gFormId: "${gFromId}",
${tabs(2)}links: [\n`;

  for (let i = 0; i < entries.length; i++) {
    const tempId = nanoId(5);
    ids.push(tempId);
    finalString += `${tabs(3)}{
${tabs(4)}entryId: "${entries[i].entry}",
${tabs(4)}formId: "${tempId}",
${tabs(4)}type: "${entries[i].type}",
${tabs(3)}},\n`;
  }

  finalString += `${tabs(2)}]\n${tabs(1)}});\n`;
  finalString += `${tabs(1)}return (\n`;
  finalString += `${tabs(2)}<form onSubmit={onSubmit} ref={ref}>\n`;

  for (let i = 0; i < entries.length; i++) {
    if (entries[i].type === "text") {
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">${entries[i].question}</label>\n`;
      finalString += `${tabs(3)}<input type="text" id="${ids[i]}" />\n`;
    }
    if (entries[i].type === "radio") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${entries[i].values[j].text}</label>\n`;
        finalString += `${tabs(4)}<input type="radio" name="${ids[i]}" id="${newId}" value="${
          entries[i].values[j].value
        }" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "textarea") {
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">\n`;
      finalString += `${tabs(4)}${entries[i].question}\n`;
      finalString += `${tabs(3)}</label>\n`;
      finalString += `${tabs(3)}<textarea id="${ids[i]}">\n`;
      finalString += `${tabs(3)}</textarea>\n`;
    }
    if (entries[i].type === "checkbox") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${entries[i].values[j].text}</label>\n`;
        finalString += `${tabs(4)}<input type="checkbox" name="${ids[i]}" id="${newId}" value="${
          entries[i].values[j].value
        }" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "date") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      finalString += `${tabs(4)}<span>Month starting from index 1 (e.g. March will be 3)</span>\n`;
      for (let j = 0; j < entries[i].dateParts?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${entries[i].dateParts[j]}</label>\n`;
        finalString += `${tabs(4)}<input type="number" name="${entries[i].dateParts[j]}" id="${newId}" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "time") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      finalString += `${tabs(4)}<span>Please use 24 Hour Format</span>\n`;
      for (let j = 0; j < entries[i].timeParts?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${entries[i].timeParts[j]}</label>\n`;
        finalString += `${tabs(4)}<input type="number" name="${entries[i].timeParts[j]}" id="${newId}" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "dropdown") {
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">${entries[i].question}</label>\n`;
      finalString += `${tabs(3)}<select id="${ids[i]}">\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        finalString += `${tabs(4)}<option value="${entries[i].values[j].value}">${
          entries[i].values[j].text
        }</option>\n`;
      }
      finalString += `${tabs(3)}</select>\n`;
    }
  }

  finalString += `${tabs(2)}</form>\n`;
  finalString += `${tabs(1)})\n`;
  finalString += `}`;

  return finalString;
};

const main = async () => {
  try {
    const currentUrl = window.location.href;
    const url = await getPrefillUrl(currentUrl);
    const gFromId = await getGFid(currentUrl);
    const html = await fetcherFunc(url);
    const entries = await parserer(html);
    const finalString = await createFinalString({ gFromId, entries });
    const containerDiv = document.querySelector(".Ltcunf");
    const oldHtml = containerDiv.innerHTML;
    const newDiv = document.createElement("div");
    newDiv.classList.add("BdZlM");
    newDiv.classList.add("useEasyGoogleForm");
    newDiv.innerHTML = "<style>.useEasyGoogleForm{margin-top: 20px; padding: 5%;}</style>";
    newDiv.innerHTML += `<p>${finalString
      .replace(/</gm, "&#60;")
      .replace(/>/gm, "&#62;")
      .replace(/\n/gm, "<br>")
      .replace(/\t/gm, "&emsp;")}</p>`;
    let newHtml = newDiv.outerHTML + oldHtml;
    containerDiv.innerHTML = newHtml;
  } catch {}
};
main();
