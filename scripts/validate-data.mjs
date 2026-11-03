import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCsv } from './data-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'data', 'source');
const schema = JSON.parse(fs.readFileSync(path.join(sourceDir, 'schema.json'), 'utf8'));
const enums = JSON.parse(fs.readFileSync(path.join(sourceDir, 'enums.json'), 'utf8'));
const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validateValue(value, definition, location) {
  if (value === '') {
    if (definition.required) error(`${location}: required value is empty`);
    return;
  }

  if (typeof value === 'string' && schema.missing_value_policy.forbidden_text_values.some((item) => item.toLowerCase() === value.toLowerCase())) {
    error(`${location}: forbidden missing-value text "${value}"`);
    return;
  }

  switch (definition.type) {
    case 'string':
      break;
    case 'boolean':
      if (value !== 'true' && value !== 'false') error(`${location}: expected true or false`);
      break;
    case 'integer':
      if (!/^-?\d+$/.test(value)) error(`${location}: expected integer`);
      break;
    case 'number':
      if (!Number.isFinite(Number(value))) error(`${location}: expected number`);
      break;
    case 'url':
      if (!isUrl(value)) error(`${location}: expected HTTP(S) URL`);
      break;
    case 'date':
      if (!isDate(value)) error(`${location}: expected YYYY-MM-DD date`);
      break;
    case 'enum':
      if (!enums[definition.enum]?.includes(value)) error(`${location}: invalid enum value "${value}"`);
      break;
    case 'reference':
      break;
    default:
      error(`${location}: unsupported schema type "${definition.type}"`);
  }

  if (definition.minimum !== undefined && Number(value) < definition.minimum) {
    error(`${location}: value is below minimum ${definition.minimum}`);
  }
}

function validateTable(tableName, table) {
  const filePath = path.join(sourceDir, table.file);
  const parsed = readCsv(filePath);
  const expectedHeaders = Object.keys(table.fields);

  if (JSON.stringify(parsed.headers) !== JSON.stringify(expectedHeaders)) {
    error(`${tableName}: CSV headers do not exactly match schema`);
  }

  for (const record of parsed.rows) {
    for (const [field, definition] of Object.entries(table.fields)) {
      validateValue(record[field] ?? '', definition, `${tableName}:${filePath}:${record.__line}:${field}`);
    }
  }

  return parsed.rows;
}

const manufacturers = validateTable('manufacturers', schema.tables.manufacturers);
const mcus = validateTable('mcus', schema.tables.mcus);
const features = validateTable('mcu_features', schema.tables.mcu_features);

function checkUnique(rows, fields, label) {
  const seen = new Map();
  for (const row of rows) {
    const key = fields.map((field) => row[field]).join('\u001f');
    if (seen.has(key)) error(`${label}: duplicate key "${key}" on lines ${seen.get(key)} and ${row.__line}`);
    else seen.set(key, row.__line);
  }
}

checkUnique(manufacturers, ['manufacturer_id'], 'manufacturers');
checkUnique(mcus, ['mcu_id'], 'mcus.mcu_id');
checkUnique(mcus, ['manufacturer_id', 'part_number'], 'mcus.part_number');
checkUnique(features, ['mcu_id', 'feature_code', 'unit'], 'mcu_features');

const manufacturerIds = new Set(manufacturers.map((row) => row.manufacturer_id));
const mcuIds = new Set(mcus.map((row) => row.mcu_id));

for (const row of mcus) {
  if (!manufacturerIds.has(row.manufacturer_id)) error(`mcus:${row.__line}: unknown manufacturer_id "${row.manufacturer_id}"`);
  if (row.vdd_min_v && row.vdd_max_v && Number(row.vdd_min_v) > Number(row.vdd_max_v)) error(`mcus:${row.__line}: vdd_min_v is greater than vdd_max_v`);
  if (row.io_voltage_min_v && row.io_voltage_max_v && Number(row.io_voltage_min_v) > Number(row.io_voltage_max_v)) error(`mcus:${row.__line}: io_voltage_min_v is greater than io_voltage_max_v`);
  if (row.temperature_min_c && row.temperature_max_c && Number(row.temperature_min_c) > Number(row.temperature_max_c)) error(`mcus:${row.__line}: temperature_min_c is greater than temperature_max_c`);
  if (row.visibility === 'published' && row.record_status !== 'verified') warn(`mcus:${row.__line}: published record is not verified`);
}

for (const row of features) {
  if (!mcuIds.has(row.mcu_id)) error(`mcu_features:${row.__line}: unknown mcu_id "${row.mcu_id}"`);
  const valueFields = ['value_bool', 'value_number', 'value_text'];
  const filled = valueFields.filter((field) => row[field] !== '');
  const expectedField = row.value_type === 'bool' ? 'value_bool' : row.value_type === 'text' ? 'value_text' : 'value_number';
  if (filled.length !== 1 || filled[0] !== expectedField) error(`mcu_features:${row.__line}: value field does not match value_type`);
  if (row.value_type === 'integer' && row.value_number !== '' && !/^-?\d+$/.test(row.value_number)) error(`mcu_features:${row.__line}: integer value_number is invalid`);
}

if (mcus.length === 0) error('mcus: source table is empty');

for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (errors.length > 0) {
  for (const item of errors) console.error(`ERROR: ${item}`);
  console.error(`Validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`Validation passed: ${mcus.length} MCU records, ${features.length} extended features, ${manufacturers.length} manufacturers.`);
