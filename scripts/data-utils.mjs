import fs from 'node:fs';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }

    if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(value.trim());
      value = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value.trim());
      value = '';
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
    } else {
      value += character;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.trim());
    if (row.some((cell) => cell !== '')) rows.push(row);
  }

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows[0];
  const records = rows.slice(1).map((cells, offset) => {
    const record = { __line: offset + 2 };
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });
    return record;
  });

  return { headers, rows: records };
}

export function readCsv(path) {
  return parseCsv(fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

export function toTypedValue(value, definition) {
  if (value === '') return null;
  if (definition.type === 'boolean') return value === 'true';
  if (definition.type === 'integer') return Number.parseInt(value, 10);
  if (definition.type === 'number') return Number(value);
  return value;
}
