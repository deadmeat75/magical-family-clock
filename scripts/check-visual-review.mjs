import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
const root = resolve("docs/visual-review"),
  record = JSON.parse(readFileSync(resolve(root, "approvals.json"))),
  inventory = JSON.parse(readFileSync(resolve(root, "inventory.json"))),
  errors = [];
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const ids = new Set();
for (const item of record.items) {
  if (ids.has(item.id)) errors.push("Duplicate decision: " + item.id);
  ids.add(item.id);
  if (!inventory.some((i) => i.id === item.id))
    errors.push("Missing inventory: " + item.id);
  if (item.decision === "approved") {
    const path = resolve(root, item.approved_example || "missing");
    if (!existsSync(path) || hash(path) !== item.approved_example_sha256)
      errors.push("Approved artwork changed: " + item.id);
  }
}
for (const item of record.items) {
  for (const component of item.approved_components || []) {
    const path = resolve(root, component.example);
    if (!existsSync(path) || hash(path) !== component.sha256)
      errors.push(
        "Approved component changed: " + item.id + " " + component.component,
      );
  }
}
for (const item of record.artwork_approvals || []) {
  const path = resolve(root, item.approved_source);
  if (!existsSync(path) || hash(path) !== item.approved_source_sha256)
    errors.push("Approved source changed: " + item.id);
}
for (const item of inventory) {
  if (!ids.has(item.id)) errors.push("Missing decision: " + item.id);
  for (const key of ["image", "animation", "source"])
    if (item[key] && !existsSync(resolve(root, item[key])))
      errors.push(item.id + " missing " + key + ": " + item[key]);
}
for (const item of inventory) {
  for (const variant of item.variants || [])
    for (const key of ["image", "animation"])
      if (variant[key] && !existsSync(resolve(root, variant[key])))
        errors.push(item.id + " missing variant: " + variant[key]);
}
for (const file of readdirSync(root).filter((f) => f.endsWith(".md"))) {
  const path = resolve(root, file),
    text = readFileSync(path, "utf8");
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|data:)/.test(target)) continue;
    if (!existsSync(resolve(dirname(path), decodeURIComponent(target))))
      errors.push(file + " broken link: " + target);
  }
}
const pending = record.items.filter(
  (i) => !["approved", "omitted"].includes(i.decision),
);
if (!record.release_hold && (pending.length || !record.release_authorized))
  errors.push(
    "Release requires complete visual decisions and recorded authorization",
  );
if (!["0.4.0", "0.4.1", "0.4.2"].includes(record.published_release))
  errors.push("Unexpected published release");
if (errors.length) {
  process.stderr.write(errors.join("\n") + "\n");
  process.exitCode = 1;
} else
  process.stdout.write(
    `Review integrity passed: ${ids.size} decisions; all approved hashes and gallery links preserved.\n`,
  );
