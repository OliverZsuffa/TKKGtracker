import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const datasetUrl = process.env.TKKGDATA_DATASET_URL
  ?? "https://raw.githubusercontent.com/OliverZsuffa/TKKGData/main/data/episodes.json";
const metadataUrl = process.env.TKKGDATA_METADATA_URL
  ?? "https://raw.githubusercontent.com/OliverZsuffa/TKKGData/main/data/dataset-metadata.json";

async function fetchJson(url, label) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not fetch ${label}: HTTP ${response.status} from ${url}`);
  }
  const text = await response.text();
  return { text, value: JSON.parse(text) };
}

const [{ text: datasetText, value: episodes }, { value: metadata }] = await Promise.all([
  fetchJson(datasetUrl, "TKKGData episode dataset"),
  fetchJson(metadataUrl, "TKKGData dataset metadata"),
]);

if (!Array.isArray(episodes) || episodes.length === 0) {
  throw new Error("TKKGData returned an empty or invalid episode array.");
}
if (!metadata || typeof metadata !== "object" || !/^1\\./.test(metadata.schema_version ?? "")) {
  throw new Error(`Unsupported TKKGData schema version: ${metadata?.schema_version ?? "missing"}`);
}
if (metadata.episode_count !== episodes.length) {
  throw new Error(`Dataset metadata reports ${metadata.episode_count} episodes, but the dataset contains ${episodes.length}.`);
}

const seen = new Set();
for (const [index, episode] of episodes.entries()) {
  if (!episode || typeof episode !== "object" || !Number.isInteger(episode.number) || episode.number < 1) {
    throw new Error(`Episode record ${index} has an invalid episode number.`);
  }
  if (seen.has(episode.number)) {
    throw new Error(`Duplicate TKKG episode number ${episode.number}.`);
  }
  seen.add(episode.number);
  if (typeof episode.title !== "string" || !episode.title.trim()) {
    throw new Error(`Episode ${episode.number} has no valid title.`);
  }
  for (const field of ["physical_releases", "tracks", "cast", "credits", "ratings", "sources", "listening_links"]) {
    if (!Array.isArray(episode[field])) {
      throw new Error(`Episode ${episode.number} is missing the array field ${field} required by TKKGTracker.`);
    }
  }
}

const numbers = [...seen].sort((a, b) => a - b);
for (let index = 1; index < numbers.length; index += 1) {
  if (numbers[index] !== numbers[index - 1] + 1) {
    throw new Error(`TKKGData episode numbering has a gap between ${numbers[index - 1]} and ${numbers[index]}.`);
  }
}

const destination = path.join(repositoryRoot, "data", "episodes.json");
await writeFile(destination, datasetText.endsWith("\n") ? datasetText : datasetText + "\n", "utf8");
console.log(`Synchronized ${episodes.length} TKKG episodes from TKKGData (schema ${metadata.schema_version}, dataset ${metadata.dataset_version}).`);
