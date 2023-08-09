import { Parser } from "htmlparser2";

const fetcherFunc = async (url: string) => {
  const fetchOne = await fetch(url);
  const text = await fetchOne.text();
  return text;
};

const parserer = async (html: string) => {
  const entries: string[] = [];
  const parse = new Parser({
    onopentag(name, attribs) {
      if (name === "input" && (attribs?.name ?? "").includes("entry.")) {
        entries.push(attribs.name.replace("entry.", ""));
      }
    }
  });
  parse.write(html);
  parse.end();
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

const createFinalString = async ({ gFromId, entries }: { gFromId: string; entries: string[] }) => {
  let finalString = `useEasyGoogleForm({\nformRef: "" /** Your react form's ref */,\ngFormId: "${gFromId}",\nlinks: [\n`;
  for (let i = 0; i < entries.length; i++) {
    finalString += `{
      entryId: "${entries[i]}",
      formId: "" /** Your react form's input id */,
    },`;
  }
  finalString += "]\n});";
  return finalString;
};

const main = async () => {
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
  newDiv.innerHTML += `<span>${finalString}</span>`;
  let newHtml = newDiv.outerHTML + oldHtml;
  containerDiv.innerHTML = newHtml;
};
main();
