import { parserer } from "src/back-end/parserer";
import { createFinalString } from "src/back-end/create-final-string";
import { testFormId, testHtml } from "src/back-end/test-data";

const main = async () => {
  try {
    const entries = await parserer(testHtml);
    const finalString = await createFinalString({
      gFromId: testFormId,
      entries
    });
    console.log(entries);
    console.log(finalString);
  } catch {
    console.log("error");
  }
};
main();
