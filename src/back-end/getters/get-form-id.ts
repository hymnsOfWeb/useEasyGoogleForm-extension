export const getGFid = async (url: string) => {
  const tempForIdOne = url.replace(
    /https:\/\/docs\.google\.com\/forms\/d(\/e)?\//gm,
    ""
  );
  const gFromId = tempForIdOne.slice(0, tempForIdOne.indexOf("/"));
  return gFromId;
};
