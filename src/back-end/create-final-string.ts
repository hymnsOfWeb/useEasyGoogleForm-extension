import { EntryType } from "src/back-end/types";
import { customAlphabet } from "nanoid/non-secure";

export const createFinalString = async ({
  gFromId,
  entries
}: {
  gFromId: string;
  entries: EntryType[];
}) => {
  const tabs = (n: number) => Array<string>(n).fill("\t").join("");
  const nanoId = customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
  );
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
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">${
        entries[i].question
      }</label>\n`;
      finalString += `${tabs(3)}<input type="text" id="${ids[i]}" />\n`;
    }
    if (entries[i].type === "radio") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${
          entries[i].values[j].text
        }</label>\n`;
        finalString += `${tabs(4)}<input type="radio" name="${
          ids[i]
        }" id="${newId}" value="${entries[i].values[j].value}" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "textarea") {
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">\n`;
      finalString += `${tabs(4)}${entries[i].question}\n`;
      finalString += `${tabs(3)}</label>\n`;
      finalString += `${tabs(3)}<textarea id="${ids[i]}"/>\n`;
    }
    if (entries[i].type === "checkbox") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${
          entries[i].values[j].text
        }</label>\n`;
        finalString += `${tabs(4)}<input type="checkbox" name="${
          ids[i]
        }" id="${newId}" value="${entries[i].values[j].value}" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "date") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      finalString += `${tabs(
        4
      )}<span>Month starting from index 1 (e.g. March will be 3)</span>\n`;
      for (let j = 0; j < entries[i].dateParts?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${
          entries[i].dateParts[j]
        }</label>\n`;
        finalString += `${tabs(4)}<input type="number" name="${
          entries[i].dateParts[j]
        }" id="${newId}" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "time") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      finalString += `${tabs(4)}<span>${entries[i].question}</span>\n`;
      finalString += `${tabs(4)}<span>Please use 24 Hour Format</span>\n`;
      for (let j = 0; j < entries[i].timeParts?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<label htmlFor="${newId}">${
          entries[i].timeParts[j]
        }</label>\n`;
        finalString += `${tabs(4)}<input type="number" name="${
          entries[i].timeParts[j]
        }" id="${newId}" />\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "dropdown") {
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">${
        entries[i].question
      }</label>\n`;
      finalString += `${tabs(3)}<select id="${ids[i]}">\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        finalString += `${tabs(4)}<option value="${
          entries[i].values[j].value
        }">${entries[i].values[j].text}</option>\n`;
      }
      finalString += `${tabs(3)}</select>\n`;
    }
  }
  finalString += `${tabs(3)}<button type="submit">Submit</button>\n`;
  finalString += `${tabs(2)}</form>\n`;
  finalString += `${tabs(1)})\n`;
  finalString += `}`;

  return finalString;
};
