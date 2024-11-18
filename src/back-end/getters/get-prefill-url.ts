export const getPrefillUrl = async (url: string) => {
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
