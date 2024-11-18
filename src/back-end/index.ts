import { getPrefillUrl } from "src/back-end/getters/get-prefill-url";
import { getGFid } from "src/back-end/getters/get-form-id";
import { parserer } from "src/back-end/parserer";
import { createFinalString } from "src/back-end/create-final-string";

const fetcherFunc = async (url: string) => {
  const fetchOne = await fetch(url);
  const text = await fetchOne.text();
  return text;
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
    newDiv.innerHTML =
      "<style>.useEasyGoogleForm{margin-top: 20px; padding: 5%;}</style>";
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
