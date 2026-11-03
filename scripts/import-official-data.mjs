import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import { readCsv } from './data-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const officialDir = path.join(root, '官方数据');
const sourceDir = path.join(root, 'data', 'source');
const schema = JSON.parse(fs.readFileSync(path.join(sourceDir, 'schema.json'), 'utf8'));
const checkedAt = process.env.OFFICIAL_CHECKED_AT || '2026-11-03';

const files = [
  {
    path: path.join(officialDir, '产品数据_20261103100.xls'),
    manufacturerId: 'geehy',
    sourceName: '官方数据/产品数据_20261103100.xls',
    format: 'apm'
  },
  {
    path: path.join(officialDir, 'Selection Guide_STM32.xlsx'),
    manufacturerId: 'st',
    sourceName: '官方数据/Selection Guide_STM32.xlsx',
    format: 'stm'
  }
];

function text(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function clean(value) {
  const result = text(value);
  if (!result || /^(?:n\/a|none|null|-)$/i.test(result)) return '';
  return result;
}

function numberValue(value) {
  const result = clean(value).replace(/,/g, '');
  if (!result) return null;
  const match = result.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function countValue(value) {
  const raw = text(value);
  if (raw === '-') return 0;
  const result = clean(value);
  if (!result) return null;
  if (/^(?:yes|true|✓)$/i.test(result)) return 1;
  const numbers = [...result.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  if (!numbers.length) return null;
  if (/[+/]/.test(result)) return numbers.reduce((sum, item) => sum + item, 0);
  return numbers[0];
}

function booleanValue(...values) {
  const rawValues = values.map(text).filter((value) => value && !/^(?:n\/a|none|null)$/i.test(value));
  if (!rawValues.length) return null;
  return rawValues.some((value) => /^(?:yes|true|✓)$/i.test(value) || (numberValue(value) ?? 0) > 0);
}

function rangeValue(value) {
  const result = clean(value).replace(/–/g, '-');
  if (!result) return [null, null];
  const match = result.match(/(-?\d+(?:\.\d+)?)\s*(?:to|~|-)\s*(-?\d+(?:\.\d+)?)/i);
  if (match) return [Number(match[1]), Number(match[2])];
  const number = numberValue(result);
  return [number, number];
}

function splitSram(value) {
  const result = clean(value);
  if (!result) return { sram: null, backup: null };
  const plusValues = result.split('+').map(numberValue).filter((item) => item !== null);
  if (plusValues.length > 1) return { sram: plusValues[0], backup: plusValues.slice(1).reduce((sum, item) => sum + item, 0) };
  const values = [...result.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  return { sram: values.length ? Math.max(...values) : null, backup: null };
}

function pinCount(packageVariant, ioCount) {
  const result = clean(packageVariant);
  const labeled = result.match(/(\d+)\s*[lL]\b/);
  if (labeled) return Number(labeled[1]);
  const packageMatch = result.match(/(?:LQFP|UFQFPN|UFBGA|TFBGA|WLCSP|TSSOP|SOP|QFN|SO|BGA|LGA|LFBGA|VFBGA|UCP|DFN|CSP)[ -]?(\d+)/i);
  if (packageMatch) return Number(packageMatch[1]);
  return ioCount ?? null;
}

function packageName(packageVariant) {
  const result = clean(packageVariant);
  if (!result) return 'unknown';
  const match = result.match(/^[A-Za-z]+/);
  return match ? match[0].toUpperCase() : result.split(/[ -]/)[0].toUpperCase();
}

function normalizeCore(value) {
  const result = clean(value);
  const match = result.match(/M\d+\+?/i);
  return match ? `Cortex-${match[0].toUpperCase()}` : result;
}

function familyValues(partNumber) {
  const part = text(partNumber).toUpperCase();
  const familyMatch = part.match(/^(STM32|APM32)[A-Z]\d/);
  const subfamilyMatch = part.match(/^(STM32|APM32)[A-Z]\d{3}/);
  return {
    family: familyMatch ? familyMatch[0] : part.slice(0, 6),
    subfamily: subfamilyMatch ? subfamilyMatch[0] : part.slice(0, 8)
  };
}

function brandValue(manufacturerId) {
  if (manufacturerId === 'st') return 'STM32';
  if (manufacturerId === 'geehy') return 'APM32';
  return text(manufacturerId).toUpperCase();
}

function rowMap(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null]));
}

function readSheet(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: false, raw: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
  const headers = rows.shift().map((header) => text(header));
  return rows.filter((row) => clean(row[0])).map((row) => rowMap(headers, row));
}

function indexed(row, format) {
  if (format === 'apm') {
    return {
      part: row['Part No.'], core: row.Core, frequency: row['Frequency(MHz)'], flash: row['FLASH(KB)'], ram: row['SRAM(KB)'], eepromBytes: null,
      fpu: row.FPU, io: row['I/Os'], voltage: row['Voltage(V)'],
      timer16: row['GPTMR(16bit)'], timer32: row['GPTMR(32bit)'], timerMotor: row['Advanced TMR(16bit)'], timerBasic: row['Basic TMR'],
      timerLowPower: row['LPTMR(16bit)'], timerLowPower32: row['LPITMR(32bit)'], timerHighResolution: null, timerFtmr16: row['FTMR(16bit)'],
      systick: row['Systick(24bit)'], iwdt: row.IWDT, wwdt: row.WWDT, wdt: row.WDT, ewdt: row.EWDT, rtc: row.RTC,
      watchdog: [row.IWDT, row.WWDT, row.WDT, row.EWDT],
      timers: [row['GPTMR(16bit)'], row['GPTMR(32bit)'], row['Advanced TMR(16bit)'], row['Basic TMR'], row['FTMR(16bit)'], row['LPITMR(32bit)']],
      adc12Cell: row['ADC 12-bit Cell'], adc12: row['ADC 12-bit Channels'], adc14Cell: null, adc14: null, adc16Cell: null, adc16: null,
      dac12Cell: row['DAC 12-bit Cell'], dac: row['DAC 12-bit Channels'], comparator: row['Analog Comparator'], opamp: null, tsc: row['TSC (Channels)'],
      serial: row['U(S)ART'], lowPowerUart: row.LPUART, spi: row.SPI, i2s: row.I2S, mspi: null, i2c: row.I2C,
      lpspi: row.LPSPI, lpi2c: row.LPI2C, lpuart: row.LPUART, can: row.CAN, qspi: row.QSPI, cec: row.CEC, fsmc: null,
      usbDevice: row['USB Device'], usbFs: row['USB OTG_FS'], usbHs: row['USB OTG_HS'], usb: [row['USB Device'], row['USB OTG_FS'], row['USB OTG_HS']], sdio: row.SDIO, mdio: row.MDIO,
      dci: row.DCI, smc: row.SMC, dmc: row.DMC, ethernet: row.Ethernet, segmentLcd: row['Segment LCD'], jpeg: row['JPEG Codec'],
      gpu: row.GPU, gpu3d: row['3D GPU'], tftLcd: row['TFT LCD'], mipiDsi: row.MIPI_DSI, sai: row.SAI, spdifrx: null, dfsdm: null,
      dcmi: null, swpmi: null, pdu: row.PDU, rng: row.RNG, trng: null, aesDes: row['AES/DES/\nTDES'], bnSm3Sm4: row['BN/\nSM3/SM4'],
      mathAccelerator: null, rf: row.RF, trustZone: row["Trust'Zone"], otfdec: row.OTFDEC, pka: row.PKA, shaHmac: row['SHA/HMAC'],
      crypto: [row['AES/DES/\nTDES'], row['BN/\nSM3/SM4']], packageVariant: row.Package, temperature: null
    };
  }
  return {
    part: row['产品型号'], core: row['内核'], frequency: row['主频（MHz）'], flash: row['Flash (Kbytes)'], ram: row['RAM（Kbytes）'], eepromBytes: row['E2PROM（Bytes）'],
    fpu: null, io: row.IO, voltage: row['工作电压'],
    timer16: row['16位定时器'], timer32: row['32位定时器'], timerMotor: row['电机控制定时器 (16-bit)'], timerBasic: null,
    timerLowPower: row['低功耗定时器'], timerLowPower32: null, timerHighResolution: row['高分辨率定时器'], timerFtmr16: null,
    systick: null, iwdt: null, wwdt: null, wdt: null, ewdt: null, rtc: null, watchdog: [],
    timers: [row['16位定时器'], row['32位定时器'], row['电机控制定时器 (16-bit)'], row['低功耗定时器'], row['高分辨率定时器']],
    adc12Cell: row['12位ADC转换单元'], adc12: row['12位ADC通道'], adc14Cell: row['14位ADC转换单元'], adc14: row['14位ADC通道'],
    adc16Cell: row['16位ADC转换单元'], adc16: row['16位ADC通道'], dac12Cell: null, dac: row['12位DAC通道'], comparator: row['比较器'], opamp: row['放大器'], tsc: null,
    serial: row['U(S)ART'], lowPowerUart: row['低功耗UART'], spi: row.SPI, i2s: row.I2S, mspi: row['M-SPI'], i2c: row.I2C,
    lpspi: null, lpi2c: null, lpuart: null, can: row.CAN, qspi: null, cec: null, fsmc: row['F（S）MC'],
    usbDevice: row['USB Device'], usbFs: row['USB FS HOST/OTG'], usbHs: row['USB HS OTG'], usb: [row['USB Device'], row['USB FS HOST/OTG'], row['USB HS OTG']], sdio: row.SDIO, mdio: row.MDIO,
    dci: row.DCMI, smc: null, dmc: null, ethernet: row.Ethernet, segmentLcd: row['Segment LCD'], jpeg: row['JPEG Codec'],
    gpu: row.GPU, gpu3d: row['3D GPU'], tftLcd: row['TFT LCD'], mipiDsi: row.MIPI_DSI, sai: row.SAI, spdifrx: row.SPDIFRX, dfsdm: row.DFSDM,
    dcmi: row.DCMI, swpmi: row.SWPMI, pdu: null, rng: null, trng: row.TRNG, aesDes: row['AES/DES'], bnSm3Sm4: null,
    mathAccelerator: row['Math Accelerator'], rf: row.RF, trustZone: row["Trust'Zone"], otfdec: row.OTFDEC, pka: row.PKA, shaHmac: row['SHA/HMAC'],
    crypto: [row['AES/DES'], row['SHA/HMAC'], row.PKA, row['Math Accelerator']], packageVariant: row['封装'], temperature: row['T° Max(℃)']
  };
}

function officialRecord(row, format, manufacturerId, sourceName, existingByPart) {
  const source = indexed(row, format);
  const partNumber = text(source.part).toUpperCase();
  const { family, subfamily } = familyValues(partNumber);
  const [vddMin, vddMax] = rangeValue(source.voltage);
  const [temperatureMin, temperatureMax] = source.temperature ? rangeValue(source.temperature) : [null, null];
  const sram = splitSram(source.ram);
  const adcCandidates = [[12, source.adc12], [14, source.adc14], [16, source.adc16]]
    .filter(([, value]) => !/^(?:n\/a|none|null|-)$/i.test(text(value)))
    .map(([bits, value]) => ({ bits, count: countValue(value) }))
    .filter((item) => item.count !== null);
  adcCandidates.sort((left, right) => right.count - left.count || right.bits - left.bits);
  const adc = adcCandidates[0] || { bits: null, count: null };
  const ioCount = countValue(source.io);
  const old = existingByPart.get(partNumber);
  const isSt = manufacturerId === 'st';
  const urlFamily = subfamily.toLowerCase();
  const productUrl = isSt ? `https://www.st.com/en/microcontrollers-microprocessors/${urlFamily}.html` : 'https://www.geehy.com/';
  const datasheetUrl = isSt ? `https://www.st.com/resource/en/datasheet/${urlFamily}.pdf` : 'https://www.geehy.com/';
  return {
    mcu_id: old?.mcu_id || `${manufacturerId}_${partNumber.toLowerCase()}`,
    manufacturer_id: manufacturerId,
    brand: brandValue(manufacturerId),
    part_number: partNumber,
    family,
    subfamily,
    description: '',
    lifecycle_status: 'active',
    record_status: 'verified',
    visibility: 'published',
    architecture: 'ARM Cortex-M',
    core: normalizeCore(source.core),
    core_revision: '',
    max_frequency_mhz: numberValue(source.frequency),
    flash_kb: numberValue(source.flash),
    sram_kb: sram.sram,
    data_eeprom_kb: source.eepromBytes === null ? null : numberValue(source.eepromBytes) === null ? null : numberValue(source.eepromBytes) / 1024,
    data_eeprom_bytes: numberValue(source.eepromBytes),
    backup_sram_kb: sram.backup,
    rom_kb: null,
    vdd_min_v: vddMin,
    vdd_max_v: vddMax,
    io_voltage_min_v: null,
    io_voltage_max_v: null,
    temperature_min_c: temperatureMin,
    temperature_max_c: temperatureMax,
    low_power_mode: null,
    package: packageName(source.packageVariant),
    package_variant: clean(source.packageVariant),
    pin_count: pinCount(source.packageVariant, ioCount),
    gpio_count: ioCount,
    fpu: booleanValue(source.fpu),
    timer_16bit_count: countValue(source.timer16),
    timer_32bit_count: countValue(source.timer32),
    timer_motor_control_count: countValue(source.timerMotor),
    timer_basic_count: countValue(source.timerBasic),
    timer_low_power_count: countValue(source.timerLowPower),
    timer_low_power_32bit_count: countValue(source.timerLowPower32),
    timer_high_resolution_count: countValue(source.timerHighResolution),
    timer_ftmr_16bit_count: countValue(source.timerFtmr16),
    systick: booleanValue(source.systick),
    iwdt: booleanValue(source.iwdt),
    wwdt: booleanValue(source.wwdt),
    wdt: booleanValue(source.wdt),
    ewdt: booleanValue(source.ewdt),
    adc_channel_count: adc.count,
    adc_resolution_bits: adc.bits,
    adc_12bit_cell_count: countValue(source.adc12Cell),
    adc_12bit_channel_count: countValue(source.adc12),
    adc_14bit_cell_count: countValue(source.adc14Cell),
    adc_14bit_channel_count: countValue(source.adc14),
    adc_16bit_cell_count: countValue(source.adc16Cell),
    adc_16bit_channel_count: countValue(source.adc16),
    dac_channel_count: countValue(source.dac),
    dac_12bit_cell_count: countValue(source.dac12Cell),
    comparator_count: countValue(source.comparator),
    opamp_count: countValue(source.opamp),
    tsc_channel_count: countValue(source.tsc),
    timer_count: source.timers.map(countValue).filter((item) => item !== null).reduce((sum, item) => sum + item, 0),
    pwm_channel_count: null,
    uart_count: 0,
    usart_count: countValue(source.serial),
    low_power_uart_count: countValue(source.lowPowerUart),
    spi_count: countValue(source.spi),
    i2s_count: countValue(source.i2s),
    mspi_count: countValue(source.mspi),
    i2c_count: countValue(source.i2c),
    lpspi_count: countValue(source.lpspi),
    lpi2c_count: countValue(source.lpi2c),
    lpuart_count: countValue(source.lpuart),
    can_count: countValue(source.can),
    qspi_count: countValue(source.qspi),
    cec_count: countValue(source.cec),
    fsmc_count: countValue(source.fsmc),
    usb_device_count: countValue(source.usbDevice),
    usb_fs_host_otg_count: countValue(source.usbFs),
    usb_hs_otg_count: countValue(source.usbHs),
    mdio_count: countValue(source.mdio),
    dci_count: countValue(source.dci),
    smc_count: countValue(source.smc),
    dmc_count: countValue(source.dmc),
    sai_count: countValue(source.sai),
    spdifrx_count: countValue(source.spdifrx),
    dfsdm_count: countValue(source.dfsdm),
    dcmi_count: countValue(source.dcmi),
    swpmi_count: countValue(source.swpmi),
    pdu: booleanValue(source.pdu),
    usb: booleanValue(...source.usb),
    ethernet: booleanValue(source.ethernet),
    sdio: booleanValue(source.sdio),
    qspi: booleanValue(source.qspi),
    rtc: booleanValue(source.rtc),
    watchdog: booleanValue(...source.watchdog),
    crypto_accelerator: booleanValue(...source.crypto),
    rng: booleanValue(source.rng),
    aes_des: booleanValue(source.aesDes),
    bn_sm3_sm4: booleanValue(source.bnSm3Sm4),
    segment_lcd: booleanValue(source.segmentLcd),
    jpeg_codec: booleanValue(source.jpeg),
    gpu: booleanValue(source.gpu),
    gpu_3d: booleanValue(source.gpu3d),
    tft_lcd: booleanValue(source.tftLcd),
    mipi_dsi: booleanValue(source.mipiDsi),
    math_accelerator: booleanValue(source.mathAccelerator),
    rf: booleanValue(source.rf),
    trust_zone: booleanValue(source.trustZone),
    otfdec: booleanValue(source.otfdec),
    pka: booleanValue(source.pka),
    sha_hmac: booleanValue(source.shaHmac),
    trng: booleanValue(source.trng),
    product_url: productUrl,
    datasheet_url: datasheetUrl,
    sample_price: old?.sample_price || '',
    batch_price: old?.batch_price || '',
    source_name: sourceName,
    source_checked_at: checkedAt,
    last_modified_at: checkedAt,
    source_note: '官方选型表导入；复合容量、接口数量按数字字段归一化。'
  };
}

function csvValue(value) {
  if (value === null || value === undefined) return '';
  const result = String(value);
  return /[",\r\n]/.test(result) ? `"${result.replace(/"/g, '""')}"` : result;
}

function writeCsv(filePath, headers, rows) {
  const contents = [headers.join(','), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(','))].join('\n') + '\n';
  fs.writeFileSync(filePath, contents, 'utf8');
}

const existingRows = readCsv(path.join(sourceDir, 'mcus.csv')).rows;
const existingByPart = new Map(existingRows.map((row) => [row.part_number.toUpperCase(), row]));
const officialRows = [];
const seenParts = new Set();
const officialIndexes = new Map();

for (const file of files) {
  if (!fs.existsSync(file.path)) throw new Error(`找不到官方数据文件：${file.path}`);
  for (const row of readSheet(file.path)) {
    const record = officialRecord(row, file.format, file.manufacturerId, file.sourceName, existingByPart);
    if (seenParts.has(record.part_number)) {
      const index = officialIndexes.get(record.part_number);
      console.warn(`WARNING: 官方数据重复型号 ${record.part_number}，保留后出现的记录（${record.package_variant}）。`);
      officialRows[index] = record;
      continue;
    }
    seenParts.add(record.part_number);
    officialIndexes.set(record.part_number, officialRows.length);
    officialRows.push(record);
  }
}

const retainedRows = existingRows
  .filter((row) => !seenParts.has(row.part_number.toUpperCase()))
  .map(({ __line, ...row }) => ({ ...row, brand: clean(row.brand) || brandValue(row.manufacturer_id) }));
const headers = Object.keys(schema.tables.mcus.fields);
writeCsv(path.join(sourceDir, 'mcus.csv'), headers, [...officialRows, ...retainedRows]);

const manufacturers = [
  ['manufacturer_id', 'name', 'display_name', 'website_url', 'enabled'],
  ['st', 'STMicroelectronics', 'STMicroelectronics', 'https://www.st.com/', 'true'],
  ['geehy', 'Geehy Semiconductor', 'Geehy Semiconductor (APM32)', 'https://www.geehy.com/', 'true']
];
writeCsv(path.join(sourceDir, 'manufacturers.csv'), manufacturers[0], manufacturers.slice(1).map((row) => Object.fromEntries(manufacturers[0].map((header, index) => [header, row[index]]))));

console.log(`Imported ${officialRows.length} official records and retained ${retainedRows.length} existing records.`);
