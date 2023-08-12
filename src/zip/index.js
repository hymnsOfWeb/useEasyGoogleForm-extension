import { createWriteStream } from "fs";
import archiver from "archiver";

var output = createWriteStream("extension.zip");
var archive = archiver("zip");

output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log("archiver has been finalized and the output file descriptor has closed.");
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);

// append files from a sub-directory and naming it `new-subdir` within the archive
archive.directory("src/base/", "easygoogle");

archive.finalize();
