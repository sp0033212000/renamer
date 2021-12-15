#!/usr/bin/env ts-node

import * as path from "path";
import * as inquirer from "inquirer";

(async () => {
  const target = await inquirer.prompt({
    name: "target",
    type: "input",
    message: "Please specific the folder path.",
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

  console.log(TARGET_DIR);
})();
