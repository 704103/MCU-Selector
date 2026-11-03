# MCU Selection Data

The files under `source/` are the maintained source data for the MCU selection tool.

- Edit source CSV files only.
- Do not manually edit files under `generated/`.
- One row in `mcus.csv` represents one exact orderable part number.
- Keep identifiers and part numbers as text when editing with spreadsheet software.
- Use an empty cell for an unconfirmed value. Use `0` or `false` only when absence is confirmed.
- Every published MCU record must include an official product URL, datasheet URL, and verification date.

The machine-readable field rules are in `source/schema.json`.

For the local official workbooks in `官方数据/`, run `npm run import:official` before `npm run build:data`. The importer converts the workbook fields into the maintained CSV and keeps the existing records that are not present in the official tables.
