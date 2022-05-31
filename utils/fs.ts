import fs from "fs";

export const fetchFile = (_path: string): string => {
  try {
    return fs.readFileSync(_path).toString();
  } catch (error) {
    console.log(error);
    return "";
  }
};

export const writeFile = (_path: string, file: any): void => {
  try {
    fs.writeFileSync(_path, file);
  } catch (error) {
    console.log(error);
  }
};
