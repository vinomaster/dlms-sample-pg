/**
 * src/server/puml.ts
 *
 * Generates a PlantUML state diagram for the Team Outing document lifecycle.
 * Run:  npm run puml
 * Output: docs/teamOuting-states.puml
 */

import fs from "fs";
import path from "path";
import { teamOutingDocuments } from "./teamOutingTypes";

const docType = teamOutingDocuments["teamOutings"];
const states = docType.states;

const lines: string[] = [
  "@startuml Team Outing Request – State Diagram",
  "hide empty description",
  "skinparam state {",
  "  BackgroundColor LightYellow",
  "  BorderColor DarkSlateGray",
  "  FontSize 13",
  "}",
  "",
  "[*] --> draft",
  "",
];

for (const [name, state] of Object.entries(states)) {
  const color = state.puml?.color ? " #" + state.puml.color.replace(/\s/g, "") : "";
  lines.push(`state "${state.label}" as ${name}${color}`);

  for (const [nextName, nextInfo] of Object.entries(state.nextStates)) {
    lines.push(`${name} --> ${nextName} : ${nextInfo.label}`);
  }
  lines.push("");
}

// Terminal states
lines.push("cancelled --> [*]");
lines.push("closed --> [*]");
lines.push("");
lines.push("@enduml");

const outDir = path.resolve(__dirname, "../../docs");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "teamOuting-states.puml");
fs.writeFileSync(outFile, lines.join("\n"), "utf-8");
console.log(`State diagram written to ${outFile}`);
console.log("Render at https://www.plantuml.com/plantuml/uml/");
