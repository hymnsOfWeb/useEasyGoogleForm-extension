import { find, findAll, findOne } from "domutils";
import { Parser, DomHandler } from "htmlparser2";
import { customAlphabet } from "nanoid/non-secure";

interface EntryType {
  type: "text" | "radio" | "textarea";
  entry: string;
  values?: {
    text: string;
    value: string;
  }[];
}

const fetcherFunc = async (url: string) => {
  const fetchOne = await fetch(url);
  const text = await fetchOne.text();
  return text;
};

const parserer = async (html: string) => {
  const entries: EntryType[] = [];
  const commonBool = (elem: any, forTextArea: boolean = false): boolean => {
    try {
      const result = forTextArea
        ? elem.name === "textarea" && ((elem.attribs?.name as string) ?? "").includes("entry.")
        : elem.name === "input" && ((elem.attribs?.name as string) ?? "").includes("entry.");
      return result;
    } catch {
      return false;
    }
  };
  const handler = new DomHandler((error, dom) => {
    if (error) {
      console.log("parsing error");
    } else {
      const textInputs = findAll((elem) => {
        return commonBool(elem) && elem.attribs?.type === "text";
      }, dom);
      textInputs.forEach((textInput) => {
        entries.push({
          type: "text",
          entry: (textInput.attribs.name ?? "").replace("entry.", ""),
          values: [{ text: textInput.attribs["aria-label"] ?? "", value: "" }]
        });
      });
      const readioInputs = findAll((elem) => {
        return commonBool(elem) && elem.attribs?.type === "hidden";
      }, dom as any);
      readioInputs.forEach((radioInput) => {
        const jsName = radioInput.attribs["jsname"];
        if (jsName) {
          const values: EntryType["values"] = [];
          const labels = findAll((elem) => {
            if (elem.name === "label" && elem.attribs["class"]?.includes("docssharedWizToggleLabeledContainer")) {
              return true;
            } else {
              return false;
            }
          }, dom);
          labels.forEach((label) => {
            const id = label.attribs["for"] ?? "//////";
            const valueDiv = findOne(
              (elem) => {
                if (elem.attribs["id"]?.includes(id)) {
                  return true;
                } else {
                  return false;
                }
              },
              dom,
              true
            );
            const textSpan = findOne(
              (elem) => {
                const parentDiv = findOne(
                  (elem) => {
                    if (elem.name === "div" && elem.attribs["class"]?.includes("ulDsOb")) {
                      return true;
                    } else {
                      return false;
                    }
                  },
                  dom,
                  true
                );
                if (elem.name === "span" && elem.parentNode === parentDiv) {
                  return true;
                } else {
                  return false;
                }
              },
              dom,
              true
            );
            const value: EntryType["values"][0] = {
              text: (textSpan?.children[0] as any).data ?? "",
              value: valueDiv?.attribs["data-value"] ?? ""
            };
            values.push(value);
          });
          entries.push({ type: "radio", entry: (radioInput.attribs.name ?? "").replace("entry.", ""), values });
        }
      });
      const textAreaInputs = findAll((elem) => {
        return commonBool(elem, true);
      }, dom);
      textAreaInputs.forEach((textAreaInput) => {
        entries.push({ type: "textarea", entry: (textAreaInput.attribs.name ?? "").replace("entry.", "") });
      });
    }
  });
  const parseTwo = new Parser(handler);
  parseTwo.write(html);
  parseTwo.end();
  console.log(entries);
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
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}">${entries[i].values[0].text}</label>\n`;
      finalString += `${tabs(3)}<input type="text" id="${ids[i]}" />\n`;
    }
    if (entries[i].type === "radio") {
      finalString += `${tabs(3)}<div id="${ids[i]}">\n`;
      for (let j = 0; j < entries[i].values?.length; j++) {
        const newId = nanoId(5);
        finalString += `${tabs(4)}<input type="radio" name="${ids[i]}" id="${newId}" value="${
          entries[i].values[j].value
        }" />\n`;
        finalString += `${tabs(4)}<label htmlFor="${newId}">${entries[i].values[j].text}</label>\n`;
      }
      finalString += `${tabs(3)}</div>\n`;
    }
    if (entries[i].type === "textarea") {
      finalString += `${tabs(3)}<label htmlFor="${ids[i]}"/>\n`;
      finalString += `${tabs(3)}<textarea id="${ids[i]}"/>\n`;
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
