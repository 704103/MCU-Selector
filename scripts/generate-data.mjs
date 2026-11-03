import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCsv, toTypedValue } from './data-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'data', 'source');
const generatedDir = path.join(root, 'data', 'generated');
const siteDataDir = path.join(root, 'site', 'data');
const schema = JSON.parse(fs.readFileSync(path.join(sourceDir, 'schema.json'), 'utf8'));
const manufacturers = readCsv(path.join(sourceDir, 'manufacturers.csv')).rows;
const mcuRows = readCsv(path.join(sourceDir, 'mcus.csv')).rows;
const featureRows = readCsv(path.join(sourceDir, 'mcu_features.csv')).rows;
const manufacturerMap = new Map(manufacturers.map((row) => [row.manufacturer_id, row]));
const featureMap = new Map();

for (const row of featureRows) {
  if (!featureMap.has(row.mcu_id)) featureMap.set(row.mcu_id, []);
  featureMap.get(row.mcu_id).push({
    code: row.feature_code,
    type: row.value_type,
    value: row.value_type === 'bool' ? row.value_bool === 'true' : row.value_type === 'text' ? row.value_text : Number(row.value_number),
    unit: row.unit || null,
    source_note: row.source_note || null
  });
}

function typedRecord(row) {
  const result = {};
  for (const [field, definition] of Object.entries(schema.tables.mcus.fields)) {
    result[field] = toTypedValue(row[field] ?? '', definition);
  }
  const manufacturer = manufacturerMap.get(row.manufacturer_id);
  result.manufacturer = manufacturer?.display_name ?? row.manufacturer_id;
  result.features = featureMap.get(row.mcu_id) ?? [];
  return result;
}

const catalog = mcuRows
  .filter((row) => row.visibility === 'published')
  .map(typedRecord);

const searchIndex = catalog.map((record) => ({
  id: record.mcu_id,
  text: [record.brand, record.part_number, record.family, record.subfamily, record.description, record.manufacturer, record.core, record.package_variant]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}));

const metadata = {
  generated_at: new Date().toISOString(),
  schema_version: schema.schema_version,
  record_count: catalog.length,
  manufacturers: [...new Set(catalog.map((record) => record.manufacturer))].sort(),
  families: [...new Set(catalog.map((record) => record.family))].sort()
};

for (const directory of [generatedDir, siteDataDir]) fs.mkdirSync(directory, { recursive: true });

const outputs = [
  ['catalog.json', catalog],
  ['search-index.json', searchIndex],
  ['metadata.json', metadata]
];

for (const [name, value] of outputs) {
  const contents = `${JSON.stringify(value)}\n`;
  fs.writeFileSync(path.join(generatedDir, name), contents, 'utf8');
  fs.writeFileSync(path.join(siteDataDir, name), contents, 'utf8');
}

console.log(`Generated ${catalog.length} published records in data/generated and site/data.`);
