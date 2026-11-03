# MCU Selection Tool

This repository contains the public MCU parameter catalog and the static selection tool.

## Current status

The catalog contains imported APM32 and STM32 selection-guide records. The static page supports direct checkbox filters, sorting, pagination and CSV export.

## Documentation

- [Data dictionary](docs/data-dictionary.md)
- [Maintenance guide](docs/maintenance-guide.md)
- [Data directory guide](data/README.md)

## Source data

Edit files under `data/source/` only. After installing dependencies with `npm ci`, import the two local official workbooks with `npm run import:official`, then run `npm run build:data`. Generated web data is created by the publishing workflow.
