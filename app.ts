#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
import * as inquirer from "inquirer";
import * as cliProgress from "cli-progress";
//@ts-ignore
import packageJson from "./package.json";
//@ts-ignore
import keypress from "keypress";

const TIMER_END = 10;

keypress(process.stdin);

(async () => {
  console.log(
    `Welcome to use \u001b[36mrenamer\u001b[0m \u001b[33mv${packageJson.version}\u001b[0m`
  );
  const bar = new cliProgress.Bar({
    format: ">> [\u001b[36m{bar}\u001b[0m] {value}s/{total}s",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    // hideCursor: true,
  });

  const target = await inquirer.prompt({
    name: "target",
    type: "input",
    message: "Please specific the folder path: ",
    validate: <T>(
      input: string
    ): boolean | string | Promise<boolean | string> => {
      return /^(.+)\/([^\/]+)$/.test(input)
        ? true
        : "The path you input is invalid.";
    },
    default: "../DOWNLOADING",
  });

  const TARGET_DIR = path.resolve(__dirname, target.target);

  console.log(
    `The target you specific was \u001b[33m${TARGET_DIR}\u001b[0m\nPlease hit \u001b[32mEnter\u001b[0m to confirm or \u001b[31mCMD + C\u001b[0m to escape`
  );

  await new Promise((resolve) => {
    let timer = 0;
    let id: NodeJS.Timeout;
    bar.start(TIMER_END, 0);

    process.stdin.on("keypress", (str, key) => {
      if (key.ctrl && key.name === "c") {
        process.exit();
      } else if (key.name === "return" || key.name === "enter") {
        bar.update(TIMER_END);
        bar.stop();
        clearInterval(id);
        resolve(null);
      }
    });
    process.stdin.setRawMode(true);
    process.stdin.resume();

    id = setInterval(() => {
      if (timer !== TIMER_END) {
        timer++;
        bar.update(timer);
      } else {
        bar.stop();
        clearInterval(id);
        resolve(null);
      }
    }, 1000);
  });

  fs.readdirSync(path.resolve(__dirname, "../DOWNLOADING"))
    .filter((dir) => !dir.match(/^\..*/))
    .map((dirname) => {
      const DIR_PATH = path.join(TARGET_DIR, dirname);
      fs.readdirSync(DIR_PATH).map((filename) => {
        const FILE_PATH = path.join(DIR_PATH, filename);
        if (filename.match(/.*.(js)|(torrent)$/)) {
          console.log(`remove file ${filename}`);
          fs.unlinkSync(FILE_PATH);
        }

        const mimeType = mime.getType(FILE_PATH) || "";
        if (mimeType.match(/^video\/.*/)) {
          const extension = mime.getExtension(mimeType);
          fs.renameSync(FILE_PATH, `${DIR_PATH}/${dirname}.${extension}`);
          console.log(
            `rename file name: ${filename} -> ${dirname}.${extension}`
          );
        }
      });
    });
  process.exit();
})();
