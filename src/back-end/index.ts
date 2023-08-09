import { Parser } from "htmlparser2";
import str from "./main-str";

const parse = new Parser({
  onopentag(name, attribs) {
    if (name === "input" && (attribs?.name ?? "").includes("entry.")) {
      console.log(attribs.name);
    }
  }
});
parse.write(str);
parse.end();
