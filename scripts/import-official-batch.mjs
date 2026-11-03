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

const batches = {
  '1': [
    ['Artery_AT32_MCU_Cross_Reference_Table_EN_V202011.xlsx', 'artery', 'artery-cross-reference'],
    ['Geehy_APM32A_Automotive_MCU_Selection.xls', 'geehy', 'geehy'],
    ['Geehy_APM32_Industrial_MCU_Selection.xls', 'geehy', 'geehy'],
    ['Geehy_G32A_Automotive_MCU_Selection.xls', 'geehy', 'geehy'],
    ['Geehy_G32R4_Encoder_MCU_Selection.xls', 'geehy', 'geehy'],
    ['Geehy_G32R_RealTime_MCU_Selection.xls', 'geehy', 'geehy'],
    ['Geehy_GW_Wireless_MCU_Selection.xls', 'geehy', 'geehy'],
    ['Holtek_32bit_MCU_Selection.xlsx', 'holtek', 'holtek'],
    ['Holtek_8bit_MCU_Selection.xlsx', 'holtek', 'holtek'],
    ['Nuvoton_32bit_KM103_MCU_Selection.xls', 'nuvoton', 'nuvoton']
  ],
  '2': [
    ['Nuvoton_8bit_8051_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_8bit_KM101_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M0Plus_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M0_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M23_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M33_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M4_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M55_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Nuvoton_Arm_Cortex_M7_MCU_Selection.xls', 'nuvoton', 'nuvoton'],
    ['Puya_PY32_Product_Selection.xls', 'puya', 'puya']
  ]
};

const batchNumber = process.argv[2] || '1';
const selectedFiles = batches[batchNumber];
if (!selectedFiles) throw new Error(`未定义导入批次：${batchNumber}`);

function raw(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function clean(value) {
  const valueText = raw(value);
  return /^(?:n\/a|none|null|--?|-)$/i.test(valueText) ? '' : valueText;
}

function numberValue(value) {
  const valueText = clean(value).replace(/,/g, '');
  if (!valueText) return null;
  const match = valueText.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function countValue(value) {
  const valueText = raw(value);
  if (!valueText) return null;
  if (/^(?:--?|n\/a|none|null)$/i.test(valueText)) return 0;
  const numbers = [...valueText.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  if (!numbers.length) return null;
  return /[+/]/.test(valueText) ? numbers.reduce((sum, item) => sum + item, 0) : numbers[0];
}

function maxCount(value) {
  const valueText = raw(value);
  if (!valueText) return null;
  if (/^(?:--?|n\/a|none|null)$/i.test(valueText)) return 0;
  const numbers = [...valueText.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  return numbers.length ? Math.max(...numbers) : null;
}

function booleanValue(...values) {
  const rawValues = values.map(raw).filter(Boolean);
  if (!rawValues.length) return null;
  if (rawValues.some((value) => /^(?:yes|true|y|✓|有)$/i.test(value) || /\b(?:present|built-in|supported)\b/i.test(value))) return true;
  if (rawValues.every((value) => /^(?:no|false|n|--?|0|none|null|无)$/i.test(value))) return false;
  return null;
}

function featureValue(value) {
  const valueText = raw(value);
  if (!valueText) return null;
  if (/^(?:--?|n\/a|none|null|no|false|0|无)$/i.test(valueText)) return false;
  return true;
}

function rangeValue(value) {
  const valueText = clean(value).replace(/[–—]/g, '-');
  if (!valueText) return [null, null];
  const match = valueText.match(/([+-]?\d+(?:\.\d+)?)\s*(?:to|~|-)\s*([+-]?\d+(?:\.\d+)?)/i);
  if (match) return [Number(match[1]), Number(match[2])];
  const number = numberValue(valueText);
  return [number, number];
}

function splitMemory(value) {
  const valueText = clean(value);
  if (!valueText) return null;
  const numbers = [...valueText.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  return numbers.length ? numbers[0] : null;
}

function memoryKb(value) {
  const valueText = clean(value);
  if (!valueText) return null;
  const matches = [...valueText.matchAll(/(\d+(?:\.\d+)?)\s*(K|KB|B)?/gi)];
  if (!matches.length) return null;
  return matches.reduce((sum, match) => sum + Number(match[1]) / (/^b$/i.test(match[2] || '') ? 1024 : 1), 0);
}

function parsePinCount(packageValue, fallback = null) {
  const valueText = clean(packageValue);
  const matches = [...valueText.matchAll(/(?:LQFP|QFP|TQFP|UFQFPN|UFBGA|TFBGA|WLCSP|TSSOP|SSOP|SOP|QFN|BGA|LGA|DFN|CSP|QFP|NSOP|QFN)[ -]?(\d+)/gi)].map((match) => Number(match[1]));
  return matches.length === 1 ? matches[0] : fallback;
}

function packageName(packageValue) {
  const valueText = clean(packageValue);
  if (!valueText || /^unknown$/i.test(valueText)) return '';
  const match = valueText.match(/[A-Za-z]+/);
  return match ? match[0].toUpperCase() : 'unknown';
}

function normalizeCore(value) {
  const valueText = clean(value).replace(/[®™]/g, '').replace(/Arm\s*/i, '').replace(/M(\d+)Plus/ig, 'M$1+').trim();
  if (!valueText) return 'unknown';
  const match = valueText.match(/M\d+\+?/i);
  if (match) return `Cortex-${match[0].toUpperCase()}`;
  return valueText.replace(/\s+/g, ' ');
}

function architectureFor(core) {
  if (/cortex/i.test(core)) return 'ARM Cortex-M';
  if (/risc[- ]?v/i.test(core)) return 'RISC-V';
  if (/8051/i.test(core)) return '8051';
  return 'other';
}

function familyValues(partNumber) {
  const part = raw(partNumber).toUpperCase();
  const match = part.match(/^[A-Z]+\d+/);
  const family = match ? match[0] : part.slice(0, 6);
  return { family: family || 'unknown', subfamily: part.slice(0, Math.min(8, part.length)) || 'unknown' };
}

function brandFor(manufacturerId, partNumber) {
  const part = raw(partNumber).toUpperCase();
  if (manufacturerId === 'artery') return 'AT32';
  if (manufacturerId === 'geehy') return part.startsWith('G32') ? 'G32' : part.startsWith('GW') ? 'GW' : 'APM32';
  if (manufacturerId === 'holtek') return 'Holtek';
  if (manufacturerId === 'nuvoton') return 'Nuvoton';
  return manufacturerId.toUpperCase();
}

function rowMap(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null]));
}

function normalizedHeaders(row) {
  return row.map((value) => raw(value).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim());
}

function readTable(filePath, headerPredicate) {
  const workbook = XLSX.readFile(filePath, { cellDates: false, raw: true });
  const tables = [];
  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null, raw: true });
    const headerIndex = rows.findIndex((row) => headerPredicate(normalizedHeaders(row)));
    if (headerIndex < 0) continue;
    const headers = normalizedHeaders(rows[headerIndex]);
    const data = rows.slice(headerIndex + 1)
      .filter((row) => row.some((value) => raw(value)))
      .map((row) => rowMap(headers, row));
    tables.push({ sheetName, headers, rows: data });
  }
  return tables;
}

function first(row, ...names) {
  for (const name of names) if (Object.prototype.hasOwnProperty.call(row, name)) return row[name];
  return null;
}

function interfaceCount(value, names) {
  const valueText = raw(value).replace(/²/g, '2').replace(/×/g, 'x');
  if (!valueText) return null;
  if (/^(?:--?|none|null|n\/a)$/i.test(valueText)) return 0;
  let total = 0;
  let found = false;
  for (const name of names) {
    const pattern = new RegExp(`(?:^|[,/; ]|\\b)(?:${name})(?:\\s*/\\s*(?:UART|USART|SPI|I2C|I2S|USB|CAN|SDIO|SCI|EBI|QSPI))*\\s*x\\s*(\\d+)`, 'ig');
    for (const match of valueText.matchAll(pattern)) {
      total += Number(match[1]);
      found = true;
    }
    const plain = new RegExp(`\\b${name}\\b`, 'i').test(valueText);
    if (plain && !found) {
      total += 1;
      found = true;
    }
  }
  return found ? total : 0;
}

function namedCount(value, names) {
  const valueText = raw(value).replace(/×/g, 'x');
  if (!valueText) return null;
  if (/^(?:--?|none|null|n\/a)$/i.test(valueText)) return 0;
  let total = 0;
  let found = false;
  for (const name of names) {
    const pattern = new RegExp(`\\b${name}\\b\\s*(?:x\\s*)?(\\d+)?`, 'i');
    const match = valueText.match(pattern);
    if (!match) continue;
    total += match[1] ? Number(match[1]) : 1;
    found = true;
  }
  return found ? total : 0;
}

function adcValues(value) {
  const valueText = raw(value);
  if (!valueText) return { channels: null, resolution: null };
  const bitMatches = [...valueText.matchAll(/(\d+)\s*-?bit\s*x\s*(\d+)/ig)];
  if (bitMatches.length) {
    const selected = bitMatches.sort((left, right) => Number(right[2]) - Number(left[2]))[0];
    return { channels: Number(selected[2]), resolution: Number(selected[1]) };
  }
  const compact = valueText.match(/(?:\d+\s*unit\s*)?(\d+)\s*(?:ch|channel)?\s*[*x]\s*(\d+)\s*-?bit/i);
  if (compact) return { channels: Number(compact[1]), resolution: Number(compact[2]) };
  const channel = valueText.match(/(?:channel|通道)\s*(?:x|×)?\s*(\d+)/i);
  const bits = valueText.match(/(\d+)\s*-?bit/i);
  return { channels: channel ? Number(channel[1]) : null, resolution: bits ? Number(bits[1]) : null };
}

function parseTimerTotal(value) {
  const valueText = raw(value);
  if (!valueText) return null;
  if (/^(?:--?|none|null|n\/a)$/i.test(valueText)) return 0;
  const numbers = [...valueText.matchAll(/(?:x|×)\s*(\d+)/gi)].map((match) => Number(match[1]));
  return numbers.length ? numbers.reduce((sum, item) => sum + item, 0) : countValue(valueText);
}

function createRecord({ manufacturerId, partNumber, core, frequency, flash, sram, voltage, temperature, packageValue, gpio, sourceName, sourceNote, productUrl, datasheetUrl, description = '' }) {
  const part = raw(partNumber).toUpperCase();
  const { family, subfamily } = familyValues(part);
  const [vddMin, vddMax] = rangeValue(voltage);
  const [temperatureMin, temperatureMax] = rangeValue(temperature);
  const normalizedCore = normalizeCore(core);
  return {
    mcu_id: `${manufacturerId}_${part.toLowerCase()}`,
    manufacturer_id: manufacturerId,
    brand: brandFor(manufacturerId, part),
    part_number: part,
    family,
    subfamily,
    description: clean(description),
    lifecycle_status: 'active',
    record_status: 'verified',
    visibility: 'published',
    architecture: architectureFor(normalizedCore),
    core: normalizedCore,
    core_revision: '',
    max_frequency_mhz: numberValue(frequency),
    flash_kb: numberValue(flash),
    sram_kb: numberValue(sram),
    data_eeprom_kb: null,
    data_eeprom_bytes: null,
    backup_sram_kb: null,
    rom_kb: null,
    vdd_min_v: vddMin,
    vdd_max_v: vddMax,
    io_voltage_min_v: null,
    io_voltage_max_v: null,
    temperature_min_c: temperatureMin,
    temperature_max_c: temperatureMax,
    low_power_mode: null,
    package: packageName(packageValue),
    package_variant: /^unknown$/i.test(clean(packageValue)) ? '' : clean(packageValue),
    pin_count: parsePinCount(packageValue),
    gpio_count: countValue(gpio),
    fpu: null,
    touch_key_channel_count: null,
    lcd_com_count: null,
    lcd_seg_count: null,
    audio: null,
    infrared: null,
    key_scan: null,
    zero_wait_flash: null,
    internal_oscillator: null,
    reset_method: '',
    interrupt_source_count: null,
    internal_opamp: null,
    pre_driver_method: '',
    timer_16bit_count: null,
    timer_32bit_count: null,
    timer_motor_control_count: null,
    timer_basic_count: null,
    timer_low_power_count: null,
    timer_low_power_32bit_count: null,
    timer_high_resolution_count: null,
    timer_ftmr_16bit_count: null,
    systick: null,
    iwdt: null,
    wwdt: null,
    wdt: null,
    ewdt: null,
    adc_channel_count: null,
    adc_resolution_bits: null,
    adc_12bit_cell_count: null,
    adc_12bit_channel_count: null,
    adc_14bit_cell_count: null,
    adc_14bit_channel_count: null,
    adc_16bit_cell_count: null,
    adc_16bit_channel_count: null,
    dac_channel_count: null,
    dac_12bit_cell_count: null,
    comparator_count: null,
    opamp_count: null,
    tsc_channel_count: null,
    timer_count: null,
    pwm_channel_count: null,
    uart_count: null,
    usart_count: null,
    low_power_uart_count: null,
    spi_count: null,
    i2s_count: null,
    mspi_count: null,
    i2c_count: null,
    lpspi_count: null,
    lpi2c_count: null,
    lpuart_count: null,
    can_count: null,
    qspi_count: null,
    cec_count: null,
    fsmc_count: null,
    usb_device_count: null,
    usb_fs_host_otg_count: null,
    usb_hs_otg_count: null,
    mdio_count: null,
    dci_count: null,
    smc_count: null,
    dmc_count: null,
    sai_count: null,
    spdifrx_count: null,
    dfsdm_count: null,
    dcmi_count: null,
    swpmi_count: null,
    pdu: null,
    rng: null,
    aes_des: null,
    bn_sm3_sm4: null,
    segment_lcd: null,
    jpeg_codec: null,
    gpu: null,
    gpu_3d: null,
    tft_lcd: null,
    mipi_dsi: null,
    math_accelerator: null,
    rf: null,
    trust_zone: null,
    otfdec: null,
    pka: null,
    sha_hmac: null,
    usb: null,
    ethernet: null,
    sdio: null,
    qspi: null,
    rtc: null,
    watchdog: null,
    crypto_accelerator: null,
    trng: null,
    product_url: productUrl,
    datasheet_url: datasheetUrl,
    sample_price: '',
    batch_price: '',
    source_name: sourceName,
    source_checked_at: checkedAt,
    last_modified_at: checkedAt,
    source_note: sourceNote
  };
}

function applyCommonFeatureFields(record, row, sourceText) {
  const timerText = first(row, 'Timers', 'Timer');
  const adc = adcValues(first(row, 'ADC [Conversion Rate, Number, Bit, Channel]', 'ADC [Bit,Channel]', 'ADC [10bit]', 'ADC [12bit]'));
  record.timer_count = parseTimerTotal(timerText);
  record.adc_channel_count = adc.channels;
  record.adc_resolution_bits = adc.resolution;
  record.rtc = featureValue(first(row, 'RTC'));
  record.watchdog = /\b(?:WDT|WWDT|watchdog)\b/i.test(sourceText) ? true : null;
  record.touch_key_channel_count = maxCount(first(row, 'Touch Key'));
  record.lcd_com_count = maxCount(first(row, 'LCD COM'));
  record.lcd_seg_count = maxCount(first(row, 'LCD SEG (max)', 'LCD SEG'));
  record.audio = /music|voice|audio/i.test(sourceText) ? true : null;
  record.infrared = /infrared|ir remote|ir driver/i.test(sourceText) ? true : null;
  record.key_scan = /key\s*scan|keyscan/i.test(sourceText) ? true : null;
  record.internal_opamp = /\b(?:opamp|opa|op amp)\b/i.test(sourceText) ? true : null;
  record.pre_driver_method = clean(first(row, 'Drivers'));
  if (!record.pre_driver_method && /driver/i.test(sourceText)) record.pre_driver_method = '见官方资料';
  return record;
}

function parseArtery(fileName) {
  const filePath = path.join(officialDir, fileName);
  const tables = readTable(filePath, (headers) => headers.includes('AT32 Part'));
  const records = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const series = raw(first(row, 'AT32 Series'));
      const suffix = raw(first(row, 'AT32 Part'));
      if (!series || !suffix || !/^AT32/i.test(series)) continue;
      const record = createRecord({
        manufacturerId: 'artery',
        partNumber: `${series}${suffix}`,
        core: first(row, 'Core'),
        frequency: first(row, 'CPU'),
        flash: first(row, 'Flash'),
        sram: first(row, 'SRAM'),
        packageValue: '',
        sourceName: `官方数据/${fileName}`,
        sourceNote: `Artery 官方 AT32 交叉参考表导入；表格未提供封装、引脚和外设明细，待按具体型号手册复核。`,
        productUrl: 'https://www.arterytek.com/en/product/',
        datasheetUrl: 'https://www.arterytek.com/en/product/'
      });
      const dspFpu = raw(first(row, 'DSP/FPU'));
      record.fpu = /yes/i.test(dspFpu) ? true : /no/i.test(dspFpu) ? false : null;
      record.internal_opamp = null;
      records.push(record);
    }
  }
  return records;
}

function parseGeehy(fileName) {
  const filePath = path.join(officialDir, fileName);
  const tables = readTable(filePath, (headers) => headers.includes('Part No.') && (headers.includes('FLASH(KB)') || headers.includes('FLASH(KB)')));
  const records = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const part = first(row, 'Part No.');
      if (!clean(part)) continue;
      const rowText = Object.values(row).map(raw).join(' ');
      const core = first(row, 'Core', 'CPU');
      const record = createRecord({
        manufacturerId: 'geehy',
        partNumber: part,
        core,
        frequency: first(row, 'Frequency(MHz)'),
        flash: first(row, 'FLASH(KB)'),
        sram: first(row, 'SRAM(KB)', 'ITCM+DTCM(KB)'),
        voltage: first(row, 'Voltage(V)'),
        temperature: first(row, 'Operating Temperature(℃)', 'Operating Temperature (°C), Tj'),
        packageValue: first(row, 'Package'),
        gpio: first(row, 'I/Os'),
        sourceName: `官方数据/${fileName}`,
        sourceNote: 'Geehy 官方选型表导入；按列名合并同语义参数，未提供的专有功能保留为空。',
        productUrl: 'https://www.geehy.com/',
        datasheetUrl: 'https://www.geehy.com/'
      });
      record.fpu = booleanValue(first(row, 'FPU'));
      record.timer_16bit_count = countValue(first(row, 'GPTMR(16bit)', 'ADTMR(16-bit)'));
      record.timer_32bit_count = countValue(first(row, 'GPTMR(32bit)'));
      record.timer_motor_control_count = countValue(first(row, 'Advanced TMR(16bit)'));
      record.timer_low_power_count = countValue(first(row, 'LPTMR(16bit)'));
      record.timer_low_power_32bit_count = countValue(first(row, 'LPITMR(32bit)'));
      record.timer_ftmr_16bit_count = countValue(first(row, 'FTMR(16bit)'));
      record.timer_high_resolution_count = countValue(first(row, 'ADTMR(16-bit)'));
      record.timer_basic_count = countValue(first(row, 'Basic TMR'));
      record.timer_count = [record.timer_16bit_count, record.timer_32bit_count, record.timer_motor_control_count, record.timer_low_power_count, record.timer_low_power_32bit_count, record.timer_ftmr_16bit_count, record.timer_basic_count]
        .filter((value) => value !== null).reduce((sum, value) => sum + value, 0);
      record.systick = booleanValue(first(row, 'Systick(24bit)'));
      record.iwdt = booleanValue(first(row, 'IWDT'));
      record.wwdt = booleanValue(first(row, 'WWDT'));
      record.wdt = booleanValue(first(row, 'WDT', 'NMIWD'));
      record.ewdt = booleanValue(first(row, 'EWDT'));
      const adc12 = countValue(first(row, 'ADC 12-bit Channels'));
      const adc16 = countValue(first(row, 'ADC 16-bit Channels'));
      record.adc_12bit_cell_count = countValue(first(row, 'ADC 12-bit Cell'));
      record.adc_12bit_channel_count = adc12;
      record.adc_16bit_cell_count = countValue(first(row, 'ADC 16-bit Cell'));
      record.adc_16bit_channel_count = adc16;
      if (adc16 !== null && (adc12 === null || adc16 >= adc12)) { record.adc_channel_count = adc16; record.adc_resolution_bits = 16; }
      else if (adc12 !== null) { record.adc_channel_count = adc12; record.adc_resolution_bits = 12; }
      record.dac_12bit_cell_count = countValue(first(row, 'DAC 12-bit Cell'));
      record.dac_channel_count = countValue(first(row, 'DAC 12-bit Channels')) || countValue(first(row, 'DAC 16bit Channels'));
      record.comparator_count = countValue(first(row, 'Analog Comparator', 'Comparator with 8-bit DAC', 'COMP(DAC 12-bit Cell Embedded)'));
      record.pwm_channel_count = countValue(first(row, 'PWM (HRPWM Channels)'));
      record.uart_count = countValue(first(row, 'UART'));
      record.usart_count = countValue(first(row, 'USART'));
      record.usart_count = record.usart_count ?? countValue(first(row, 'U(S)ART'));
      record.spi_count = countValue(first(row, 'SPI'));
      record.i2s_count = countValue(first(row, 'I2S'));
      record.i2c_count = countValue(first(row, 'I2C'));
      record.lpspi_count = countValue(first(row, 'LPSPI'));
      record.lpi2c_count = countValue(first(row, 'LPI2C'));
      record.lpuart_count = countValue(first(row, 'LPUART'));
      record.can_count = countValue(first(row, 'CAN', 'CAN(CAN FD)'));
      record.qspi_count = countValue(first(row, 'QSPI'));
      record.usb_device_count = countValue(first(row, 'USB Device'));
      record.usb_fs_host_otg_count = countValue(first(row, 'USB OTG_FS'));
      record.usb_hs_otg_count = countValue(first(row, 'USB OTG_HS'));
      record.usb = booleanValue(first(row, 'USB Device'), first(row, 'USB OTG_FS'), first(row, 'USB OTG_HS'));
      record.sdio = booleanValue(first(row, 'SDIO'));
      record.ethernet = booleanValue(first(row, 'Ethernet'));
      record.rng = booleanValue(first(row, 'RNG'));
      record.aes_des = booleanValue(first(row, 'AES/DES/ TDES', 'AES/DES/TDES'));
      record.bn_sm3_sm4 = booleanValue(first(row, 'BN/ SM3/ SM4', 'BN/SM3/SM4'));
      record.pdu = booleanValue(first(row, 'PDU'));
      record.rtc = booleanValue(first(row, 'RTC'));
      record.internal_opamp = record.opamp_count !== null ? record.opamp_count > 0 : null;
      record.zero_wait_flash = /zero.?wait|0.?wait/i.test(rowText) ? true : null;
      applyCommonFeatureFields(record, row, rowText);
      if (/^GW/i.test(raw(part))) {
        record.rf = true;
        record.internal_oscillator = null;
        record.infrared = featureValue(first(row, 'Infrared Emitting & Receiving'));
        record.key_scan = featureValue(first(row, 'Keyscan Decoder (Rows & Columns)'));
      }
      records.push(record);
    }
  }
  return records;
}

function parseHoltek(fileName) {
  const isEightBit = /8bit/i.test(fileName);
  const filePath = path.join(officialDir, fileName);
  const tables = readTable(filePath, (headers) => headers[0] === 'Part No.');
  const records = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const part = first(row, 'Part No.');
      if (!clean(part)) continue;
      const rowText = Object.values(row).map(raw).join(' ');
      const packageValue = first(row, 'Package');
      const core = isEightBit ? '8-bit MCU' : first(row, 'MCU Core');
      const record = createRecord({
        manufacturerId: 'holtek',
        partNumber: part,
        core,
        frequency: first(row, 'Max. Freq. (MHz)'),
        flash: isEightBit ? null : first(row, 'Flash (KB)'),
        sram: isEightBit ? (numberValue(first(row, 'Data Memory (B)')) === null ? null : numberValue(first(row, 'Data Memory (B)')) / 1024) : first(row, 'SRAM (KB)'),
        voltage: first(row, 'VDD (V)'),
        temperature: first(row, 'Temp. Range (°C)'),
        packageValue,
        gpio: first(row, 'I/O (max)'),
        description: first(row, 'MCU Type'),
        sourceName: `官方数据/${fileName}`,
        sourceNote: isEightBit ? 'Holtek 官方 8-bit 选型表导入；Program Memory 原单位为 KW，未强行换算为 Flash KB。' : 'Holtek 官方 32-bit 选型表导入；多封装型号保留原始封装列表。',
        productUrl: 'https://www.holtek.com/',
        datasheetUrl: 'https://www.holtek.com/'
      });
      record.data_eeprom_bytes = numberValue(first(row, 'Data EEPROM (B)'));
      record.data_eeprom_kb = record.data_eeprom_bytes === null ? null : record.data_eeprom_bytes / 1024;
      record.fpu = /cortex-m4/i.test(raw(core)) ? true : null;
      record.timer_count = parseTimerTotal(first(row, 'Timers'));
      const adc = adcValues(first(row, 'ADC [Conversion Rate, Number, Bit, Channel]', 'ADC [Bit,Channel]'));
      record.adc_channel_count = adc.channels;
      record.adc_resolution_bits = adc.resolution;
      record.pwm_channel_count = countValue(first(row, 'PWM Output (ch)', 'PWM'));
      record.spi_count = interfaceCount(first(row, 'Interface'), ['SPI']);
      record.i2c_count = interfaceCount(first(row, 'Interface'), ['I2C']);
      record.i2s_count = interfaceCount(first(row, 'Interface'), ['I2S']);
      record.uart_count = interfaceCount(first(row, 'Interface'), ['UART']);
      record.usart_count = interfaceCount(first(row, 'Interface'), ['USART']);
      record.usb_device_count = interfaceCount(first(row, 'Interface'), ['USB']);
      record.sdio = featureValue(/\bSDIO\b/i.test(raw(first(row, 'Interface'))) ? 'yes' : '--');
      record.can_count = interfaceCount(first(row, 'Interface'), ['CAN']);
      const analogText = first(row, 'Analog');
      record.comparator_count = namedCount(analogText, ['Comparator']);
      record.opamp_count = namedCount(analogText, ['OPA', 'Op Amp']);
      record.internal_opamp = record.opamp_count === null ? null : record.opamp_count > 0;
      record.internal_oscillator = isEightBit ? /\b(?:HIRC|LIRC|MIRC)\b/i.test(raw(first(row, 'OSC'))) : null;
      record.audio = /music|voice/i.test(rowText) ? true : featureValue(first(row, 'Music/Voice'));
      record.infrared = /infrared|ir remote|ir driver/i.test(rowText) ? true : null;
      record.key_scan = /key\s*scan|keyscan/i.test(rowText) ? true : null;
      record.touch_key_channel_count = maxCount(first(row, 'Touch Key'));
      record.lcd_com_count = maxCount(first(row, 'LCD COM'));
      record.lcd_seg_count = maxCount(first(row, 'LCD SEG (max)', 'LCD SEG'));
      record.pre_driver_method = clean(first(row, 'Drivers'));
      record.reset_method = /reset/i.test(raw(first(row, 'Others'))) ? raw(first(row, 'Others')) : '';
      records.push(record);
    }
  }
  return records;
}

function lifecycleFromStatus(value) {
  const status = raw(value).toLowerCase();
  if (/nrnd|not recommended/.test(status)) return 'nrnd';
  if (/obsolete|eol|discontinued/.test(status)) return 'obsolete';
  return 'active';
}

function parseNuvoton(fileName) {
  const filePath = path.join(officialDir, fileName);
  const tables = readTable(filePath, (headers) => headers[0] === 'PartNo' || headers[0] === 'Part No.');
  const records = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const part = first(row, 'PartNo', 'Part No.');
      if (!clean(part)) continue;
      const rowText = Object.values(row).map(raw).join(' ');
      const core = first(row, 'Core') || (/8051/i.test(fileName) ? '8051' : /KM101/i.test(fileName) ? '8-bit MCU' : fileName.match(/Cortex_(M0Plus|M0|M23|M33|M4|M55|M7)/i)?.[1] || 'Nuvoton MCU');
      const minVoltage = first(row, 'Min Operating Voltage (V)', 'Operating Voltage (min)');
      const maxVoltage = first(row, 'Max Operating Voltage (V)', 'Operating Voltage (max)');
      const minTemperature = first(row, 'Operating Temperature (min)', 'Operating Temp. Range (°C )');
      const maxTemperature = first(row, 'Operating Temperature (max)');
      const packageType = first(row, 'Package Type', 'Package');
      const packageSize = first(row, 'Package Size');
      const flash = first(row, 'Flash', 'APROM Flash', 'APROM Flash(KB)', 'ROM Size (KB)');
      const sram = first(row, 'SRAM', 'SRAM(KB)', 'RAM Size (KB)');
      const frequency = first(row, 'Operating Frequency', 'Operating Frequency (MHz)', 'Max Operating Frequency (MHz)') || rowText.match(/(\d+(?:\.\d+)?)\s*MHz/i)?.[1];
      const record = createRecord({
        manufacturerId: 'nuvoton',
        partNumber: part,
        core,
        frequency,
        flash,
        sram: /^\d/.test(raw(sram)) && /[+]/.test(raw(sram)) ? memoryKb(sram) : sram,
        voltage: minVoltage || maxVoltage ? `${minVoltage || ''} to ${maxVoltage || ''}` : '',
        temperature: maxTemperature ? `${minTemperature || ''} to ${maxTemperature}` : minTemperature,
        packageValue: packageSize ? `${packageType || ''} ${packageSize}` : packageType,
        gpio: first(row, 'GPIO', 'I/O', 'Number of I/O Ports (channel)'),
        description: first(row, 'Applications', 'Product Family'),
        sourceName: `官方数据/${fileName}`,
        sourceNote: 'Nuvoton 官方选型表导入；不同系列采用同语义字段映射，未提供的型号级参数保留为空。',
        productUrl: 'https://www.nuvoton.com/products/microcontrollers/',
        datasheetUrl: 'https://www.nuvoton.com/products/microcontrollers/'
      });
      record.lifecycle_status = lifecycleFromStatus(first(row, 'Status', 'Mass Production'));
      record.pin_count = countValue(first(row, 'Pin Count')) || parsePinCount(packageType);
      record.fpu = /M4|M7|M55/i.test(raw(core)) ? true : /8051|M0|M23/i.test(raw(core)) ? false : null;
      record.timer_count = parseTimerTotal(first(row, 'Timer', 'Timer(32N/Abit)', '16-bit Timer (channel)', '8-bit Timer (channel)'));
      record.timer_16bit_count = countValue(first(row, '16-bit Timer (channel)'));
      record.timer_basic_count = countValue(first(row, '8-bit Timer (channel)'));
      record.pwm_channel_count = countValue(first(row, 'PWM (channel)', 'PWM'));
      record.spi_count = countValue(first(row, 'SPI', 'Serial I/F [Clock Synchronous] (channel)', 'SPI/I²S+LPSPI', 'SPI/I²S'));
      record.i2c_count = countValue(first(row, 'I2C', 'I²C', 'I²C + LPI²C', 'Serial I/F [I2C] (channel)'));
      record.i2s_count = countValue(first(row, 'I²S', 'I2S/ AC97', 'SPI/I²S'));
      record.uart_count = countValue(first(row, 'UART', 'UART + LPUART', 'Serial I/F [UART] (channel)'));
      record.can_count = countValue(first(row, 'CAN', 'CAN FD', 'Serial I/F [CAN] (channel)'));
      record.qspi_count = countValue(first(row, 'Quad SPI', 'QSPI'));
      record.usb_device_count = countValue(first(row, 'USB Device', 'USB HS + FS', 'USB'));
      record.usb = featureValue(first(row, 'USB Device', 'USB HS + FS', 'USB'));
      record.sdio = featureValue(first(row, 'SD Host'));
      record.ethernet = featureValue(first(row, 'Ethernet MAC', 'Ethernet 10/100'));
      const adcName = ['ADC', 'EADC(12N/Abit)', 'LPADC(12N/Abit)', 'ADC [10bit] (channel)', 'ADC [12bit] (channel)'].find((name) => Object.prototype.hasOwnProperty.call(row, name)) || '';
      const adcText = first(row, adcName);
      const adc = adcValues(adcText);
      record.adc_channel_count = adc.channels ?? countValue(adcText);
      record.adc_resolution_bits = adc.resolution || (/10bit|10n/i.test(`${adcName} ${raw(adcText)}`) ? 10 : /12bit|12n/i.test(`${adcName} ${raw(adcText)}`) ? 12 : null);
      record.dac_channel_count = countValue(first(row, 'DAC', 'DAC [8bit] (channel)', 'DAC(12N/Abit)'));
      record.comparator_count = countValue(first(row, 'Comparator', 'Analog Comparator'));
      record.opamp_count = countValue(first(row, 'Op Amp', 'OP Amp.', 'Op amp', 'OPA'));
      record.internal_opamp = record.opamp_count === null ? null : record.opamp_count > 0;
      record.touch_key_channel_count = countValue(first(row, 'Touch Key'));
      record.audio = featureValue(first(row, 'Audio Codec', 'Audio Mic.', 'Audio Speaker', 'DMIC(4-ch)'));
      record.lcd_seg_count = countValue(first(row, 'LCD [SEG] (channel)'));
      record.lcd_com_count = countValue(first(row, 'LCD [COM] (channel)'));
      record.rtc = featureValue(first(row, 'RTC', 'RTC(Vbat)'));
      record.interrupt_source_count = countValue(first(row, 'Interrupt Sources (channel)', 'INT'));
      record.internal_oscillator = featureValue(first(row, 'High Speed On Chip Oscillator Frequency (MHz)', 'Low Speed On Chip Oscillator Frequency (kHz) ', 'IRC'));
      record.reset_method = clean(first(row, 'Power On Reset'));
      record.watchdog = countValue(first(row, 'Watch Dog Timer (channel)')) > 0;
      record.infrared = /infrared|ir remote/i.test(rowText) ? true : null;
      record.key_scan = /key\s*scan|keyscan/i.test(rowText) ? true : null;
      records.push(record);
    }
  }
  return records;
}

function parsePuya(fileName) {
  const filePath = path.join(officialDir, fileName);
  const tables = readTable(filePath, (headers) => headers[0] === 'Part No.');
  const records = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const part = first(row, 'Part No.');
      if (!clean(part)) continue;
      const core = first(row, 'Core');
      const packageType = first(row, 'Package Type');
      const packageSize = first(row, 'Package Size(mm)');
      const record = createRecord({
        manufacturerId: 'puya',
        partNumber: part,
        core,
        frequency: first(row, 'Max CLK（MHz）'),
        flash: first(row, 'Flash（KB）'),
        sram: first(row, 'SRAM（KB）'),
        packageValue: packageSize ? `${packageType || ''} ${packageSize}` : packageType,
        gpio: first(row, 'I/Os'),
        temperature: first(row, 'Operation Temp. （℃）'),
        sourceName: `官方数据/${fileName}`,
        sourceNote: 'Puya 官方 PY32 选型表导入；封装类型和封装尺寸保留在封装字段。',
        productUrl: 'https://www.puyasemi.com/',
        datasheetUrl: 'https://www.puyasemi.com/'
      });
      record.lifecycle_status = lifecycleFromStatus(first(row, 'Status'));
      record.fpu = /f$/i.test(raw(core)) ? true : null;
      record.timer_16bit_count = countValue(first(row, 'GPTM'));
      record.timer_motor_control_count = countValue(first(row, 'ADTM'));
      record.timer_basic_count = countValue(first(row, 'Basic TM'));
      record.timer_low_power_count = countValue(first(row, 'LPTIMER'));
      record.timer_count = [record.timer_16bit_count, record.timer_motor_control_count, record.timer_basic_count, record.timer_low_power_count]
        .filter((value) => value !== null).reduce((sum, value) => sum + value, 0);
      record.systick = booleanValue(first(row, 'Systic'));
      record.watchdog = featureValue(first(row, 'WDG'));
      record.rtc = featureValue(first(row, 'RTC'));
      record.pwm_channel_count = countValue(first(row, 'PWM CHs', 'EPWM / CHs'));
      record.usart_count = countValue(first(row, 'USART'));
      record.uart_count = countValue(first(row, 'UART'));
      record.lpuart_count = countValue(first(row, 'LPUART'));
      record.i2c_count = countValue(first(row, 'I2C'));
      record.spi_count = countValue(first(row, 'SPI'));
      record.i2s_count = countValue(first(row, 'I2S'));
      record.ethernet = featureValue(first(row, '10/100 ETH'));
      record.usb_device_count = featureValue(first(row, 'USB')) ? 1 : 0;
      record.usb = featureValue(first(row, 'USB'));
      record.can_count = /\bCAN\b/i.test(raw(first(row, 'CAN'))) ? 1 : 0;
      record.segment_lcd = featureValue(first(row, 'LCDC', 'LCD'));
      record.sdio = featureValue(first(row, 'SDIO'));
      record.qspi_count = countValue(first(row, 'ESMC'));
      record.math_accelerator = featureValue(first(row, 'Cordic'));
      record.crypto_accelerator = featureValue(first(row, 'AES RNG'));
      const adcText = first(row, '12bit ADC Units(CHs)');
      record.adc_12bit_cell_count = countValue(adcText);
      record.adc_12bit_channel_count = maxCount(adcText);
      record.adc_channel_count = record.adc_12bit_channel_count;
      record.adc_resolution_bits = 12;
      record.dac_12bit_cell_count = countValue(first(row, '12bit DAC Units(CHs)'));
      record.dac_channel_count = maxCount(first(row, '12bit DAC Units(CHs)'));
      record.comparator_count = countValue(first(row, 'CMP'));
      record.opamp_count = countValue(first(row, 'OPA/PGA'));
      record.internal_opamp = record.opamp_count === null ? null : record.opamp_count > 0;
      record.audio = /audio|voice/i.test(Object.values(row).map(raw).join(' ')) ? true : null;
      record.infrared = /infrared|ir remote/i.test(Object.values(row).map(raw).join(' ')) ? true : null;
      records.push(record);
    }
  }
  return records;
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

function mergeRecord(record, existing) {
  if (!existing) return record;
  const merged = { ...record, mcu_id: existing.mcu_id || record.mcu_id };
  for (const field of Object.keys(schema.tables.mcus.fields)) {
    const existingValue = existing[field] ?? '';
    const oldUnknown = ['package', 'package_variant'].includes(field) && /^unknown$/i.test(existingValue);
    if (!oldUnknown && (merged[field] === null || merged[field] === undefined || merged[field] === '')) merged[field] = existingValue;
  }
  merged.sample_price = existing.sample_price || '';
  merged.batch_price = existing.batch_price || '';
  return merged;
}

function importerFor(format) {
  if (format === 'artery-cross-reference') return parseArtery;
  if (format === 'geehy') return parseGeehy;
  if (format === 'holtek') return parseHoltek;
  if (format === 'nuvoton') return parseNuvoton;
  if (format === 'puya') return parsePuya;
  throw new Error(`未知导入格式：${format}`);
}

const existingRows = readCsv(path.join(sourceDir, 'mcus.csv')).rows;
const existingByKey = new Map(existingRows.map((row) => [`${row.manufacturer_id}|${row.part_number.toUpperCase()}`, row]));
const importedByKey = new Map();
for (const [fileName, manufacturerId, format] of selectedFiles) {
  const filePath = path.join(officialDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error(`找不到官方数据文件：${filePath}`);
  for (const record of importerFor(format)(fileName)) {
    const key = `${record.manufacturer_id}|${record.part_number}`;
    if (!record.part_number) continue;
    if (importedByKey.has(key)) console.warn(`WARNING: 批次内重复型号 ${record.part_number}，保留后出现记录。`);
    importedByKey.set(key, mergeRecord(record, existingByKey.get(key)));
  }
}

const importedKeys = new Set(importedByKey.keys());
const retainedRows = existingRows
  .filter((row) => !importedKeys.has(`${row.manufacturer_id}|${row.part_number.toUpperCase()}`))
  .map(({ __line, ...row }) => row);
const headers = Object.keys(schema.tables.mcus.fields);
writeCsv(path.join(sourceDir, 'mcus.csv'), headers, [...importedByKey.values(), ...retainedRows]);

const manufacturerHeaders = Object.keys(schema.tables.manufacturers.fields);
const manufacturerRows = readCsv(path.join(sourceDir, 'manufacturers.csv')).rows.map(({ __line, ...row }) => row);
const additions = [
  ['artery', 'Artery Technology', 'Artery', 'https://www.arterytek.com/', 'true'],
  ['holtek', 'Holtek Semiconductor', 'Holtek', 'https://www.holtek.com/', 'true'],
  ['nuvoton', 'Nuvoton Technology', 'Nuvoton', 'https://www.nuvoton.com/', 'true'],
  ['puya', 'Puya Semiconductor', 'Puya', 'https://www.puyasemi.com/', 'true']
].map((values) => Object.fromEntries(manufacturerHeaders.map((header, index) => [header, values[index]])));
const manufacturerById = new Map(manufacturerRows.map((row) => [row.manufacturer_id, row]));
for (const row of additions) if (!manufacturerById.has(row.manufacturer_id)) manufacturerById.set(row.manufacturer_id, row);
writeCsv(path.join(sourceDir, 'manufacturers.csv'), manufacturerHeaders, [...manufacturerById.values()]);

console.log(`Batch ${batchNumber}: imported ${importedByKey.size} records from ${selectedFiles.length} official files; retained ${retainedRows.length} existing records.`);
