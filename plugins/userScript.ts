import pkg from "../package.json" with { type: "json" };

const getAuthor = (author: unknown): string => {
  if (typeof author === "string") return author;
  if (
    author &&
    typeof author === "object" &&
    "name" in author &&
    typeof author.name === "string"
  ) {
    return author.name;
  }
  return "";
};

export const userScriptPlugin = (data: {
  name: string;
  runAt: 'document-start' | 'document-end' | 'document-idle';
  grant: string | string[] | 'none';
  match: string[];
  description?: string;
  updateURL?: string;
  downloadURL?: string;
}) => {
  return {
    name: "tsdown-plugin-userscript",
    banner() {
      const matchLines = data.match
        .map((matchUrl) => `// @match        ${matchUrl}`)
        .join("\n");

      const grantLines = Array.isArray(data.grant)
        ? data.grant.map((g) => `// @grant        ${g}`).join("\n")
        : `// @grant        ${data.grant}`;

      const author = getAuthor(pkg.author);
      const supportURL =
        typeof pkg.bugs === "object" && pkg.bugs !== null && "url" in pkg.bugs
          ? pkg.bugs.url
          : "";

      const banner = `// ==UserScript==
// @name         ${data.name}
// @namespace    ${pkg.homepage ?? ""}
// @license      ${pkg.license ?? ""}
// @supportURL   ${supportURL}
${data.updateURL ? `// @updateURL    ${data.updateURL}\n` : ""}${data.downloadURL ? `// @downloadURL  ${data.downloadURL}\n` : ""}// @version      ${pkg.version}
// @description  ${data.description ?? pkg.description ?? ""}
// @author       ${author}
// @run-at       ${data.runAt}
${grantLines}
${matchLines}
// ==/UserScript==
`;
      return banner;
    },
  };
};
