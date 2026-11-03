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
  ],
  '3': [
    ['WCH_MCU_Selection.xlsx', 'wch', 'wch'],
    ['MindMotion_MM32_Product_Selection_Guide_SC.pdf', 'mindmotion', 'mindmotion-pdf'],
    ['Nationz_N32G031_Datasheet.pdf', 'nationz', 'nationz-n32g031-pdf'],
    ['Nationz_N32G435_Datasheet.pdf', 'nationz', 'nationz-n32g435-pdf'],
    ['Wuxin_CW32L012_Datasheet_CN.pdf', 'wuxin', 'wuxin-pdf'],
    ['ESSEMI_ES32_Product_Catalog.pdf', 'essemi', 'essemi-ocr'],
    ['GD32_MCU_Selection_Guide_2025_CN.pdf', 'gd32', 'pdf-family-overview'],
    ['Megawin_2026_MCU_Selection_Table_SC.pdf', 'megawin', 'pdf-family-overview'],
    ['Megawin_2026_Product_Manual_SC.pdf', 'megawin', 'pdf-family-overview'],
    ['Synwit_SWM_MCU_Catalog.pdf', 'synwit', 'synwit-ocr']
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
  const match = valueText.match(/([+-]?\d+(?:\.\d+)?)\s*(?:°?C\s*)?(?:to|~|-)\s*([+-]?\d+(?:\.\d+)?)/i);
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

function readMarkdown(fileName) {
  return fs.readFileSync(path.join(sourceDir, 'pdf-md', fileName.replace(/\.pdf$/i, '.md')), 'utf8');
}

function firstNumberAfter(value, marker) {
  const text = raw(value);
  const index = text.indexOf(marker);
  if (index < 0) return null;
  return numberValue(text.slice(index + marker.length));
}

function wchAdcValues(value) {
  const text = raw(value);
  if (!text) return { cells: null, channels: null, resolution: null };
  const match = text.match(/(\d+)\s*(?:unit\s*)?[/,]\s*(\d+)(?:\s*[*x]\s*(\d+)\s*-?bit)?/i);
  if (!match) return adcValues(text);
  return {
    cells: Number(match[1]),
    channels: Number(match[2]),
    resolution: match[3] ? Number(match[3]) : null
  };
}

function wchMemoryKb(value) {
  const text = clean(value);
  if (!text) return null;
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(KB?|B)?/gi)];
  if (!matches.length) return null;
  const hasKilobyteUnit = matches.some((match) => /^K/i.test(match[2] || ''));
  return matches.reduce((sum, match) => {
    const amount = Number(match[1]);
    if (/^K/i.test(match[2] || '')) return sum + amount;
    if (/^B/i.test(match[2] || '') || !hasKilobyteUnit) return sum + amount / 1024;
    return sum + amount / 1024;
  }, 0);
}

function countSlashParts(value) {
  const text = clean(value);
  if (!text) return null;
  const numbers = [...text.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  return numbers.length ? numbers.reduce((sum, item) => sum + item, 0) : null;
}

function setInterfaceCounts(record, row) {
  const triplet = raw(first(row, 'UART/SPI/IIC'));
  if (triplet) {
    const parts = triplet.split('/').map((item) => countValue(item));
    record.uart_count = parts[0] ?? null;
    record.spi_count = parts[1] ?? null;
    record.i2c_count = parts[2] ?? null;
  } else {
    const serial = first(row, 'U(S)ART', 'UART/USART', 'UART');
    const combined = countValue(serial);
    if (Object.prototype.hasOwnProperty.call(row, 'U(S)ART') || Object.prototype.hasOwnProperty.call(row, 'UART/USART')) {
      record.usart_count = combined;
    } else {
      record.uart_count = combined;
    }
    const spiIis = raw(first(row, 'SPI/IIS', 'SPI/I²S'));
    const spiIisParts = spiIis.match(/^(\d+)\s*\/\s*(\d+)/);
    record.spi_count = spiIisParts ? Number(spiIisParts[1]) : countValue(first(row, 'SPI'));
    record.i2s_count = spiIisParts ? Number(spiIisParts[2]) : countValue(first(row, 'IIS', 'I²S'));
  }
  if (!triplet) record.i2c_count = countValue(first(row, 'IIC', 'I²C'));
  record.can_count = countValue(first(row, 'CAN'));
  record.usb = featureValue(first(row, 'USB'));
  record.usb_device_count = record.usb === true ? 1 : record.usb === false ? 0 : null;
  record.ethernet = featureValue(first(row, 'Ethernet', 'ETH'));
  record.rf = featureValue(first(row, 'BLE'));
  record.sdio = featureValue(first(row, 'SDIO'));
  record.rtc = featureValue(first(row, 'RTC'));
  return record;
}

function parseWch(fileName) {
  const filePath = path.join(officialDir, fileName);
  const tables = readTable(filePath, (headers) => headers.some((header) => /^Part NO?\.?$/i.test(header)));
  const records = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const partValue = first(row, 'Part NO.', 'Part NO', 'Part No.', 'Part No');
      const part = clean(partValue).replace(/\*/g, '');
      if (!part || /\//.test(part) || !/^CH\d/i.test(part)) continue;
      const rowText = Object.values(row).map(raw).join(' ');
      const core = first(row, 'Core') || (/(?:E8051|汇编)/i.test(table.sheetName) ? '8051' : 'RISC-V');
      const minimalAssembly = /汇编/i.test(table.sheetName);
      const record = createRecord({
        manufacturerId: 'wch',
        partNumber: part,
        core,
        frequency: first(row, 'Freq', 'Frequency'),
        flash: minimalAssembly ? null : first(row, 'Flash', 'CodeROM'),
        sram: wchMemoryKb(first(row, 'SRAM', 'RAM', 'DataRAM')),
        voltage: first(row, 'VDD', 'Voltage'),
        temperature: first(row, 'Temperature', 'Temperature ℃'),
        packageValue: first(row, 'Package'),
        gpio: first(row, 'GPIO', 'I/O'),
        sourceName: `官方数据/${fileName}`,
        sourceNote: `WCH 官方选型表导入（${table.sheetName}）；系列汇总行和带斜杠的组合型号未生成独立订货型号。`,
        productUrl: 'https://www.wch.cn/products/MCU.html',
        datasheetUrl: 'https://www.wch.cn/products/MCU.html'
      });
      const adc = wchAdcValues(first(row, 'ADC Unit/CH', 'ADC', 'TouchKey/ADC'));
      record.adc_12bit_cell_count = adc.cells;
      record.adc_12bit_channel_count = adc.channels;
      record.adc_channel_count = adc.channels;
      record.adc_resolution_bits = adc.resolution;
      record.touch_key_channel_count = countValue(first(row, 'TouchKey', 'Touch Key'));
      record.opamp_count = countValue(first(row, 'OPA'));
      record.internal_opamp = record.opamp_count === null ? null : record.opamp_count > 0;
      record.audio = featureValue(first(row, 'Audio'));
      record.audio = record.audio ?? (/audio|voice|music|beeper/i.test(rowText) ? true : null);
      record.infrared = /infrared|ir remote|ir driver/i.test(rowText) ? true : null;
      record.key_scan = /key\s*scan|keyscan/i.test(rowText) ? true : null;
      record.zero_wait_flash = featureValue(first(row, '0-Wait Flash', '0-Wait'));
      record.internal_oscillator = featureValue(first(row, 'Built-in OSC/WDOG', 'Internal Oscillator', 'OSC'));
      record.reset_method = clean(first(row, 'Reset Method', 'Reset'));
      record.interrupt_source_count = countValue(first(row, 'Interrupt', 'Interrupt Sources'));
      const other = raw(first(row, 'Other Features', 'Others', '应用'));
      record.pre_driver_method = /pre.?driver|gate\s*driver|预驱/i.test(`${rowText} ${other}`) ? other || '见官方资料' : '';
      record.segment_lcd = featureValue(first(row, 'LCD', 'Segment LCD'));
      record.qspi_count = countValue(first(row, 'QSPI'));
      record.pwm_channel_count = countValue(first(row, 'PWM', 'CAP/PWM'));
      record.timer_count = countSlashParts(first(row, 'Adv/GP Timer', 'Adv/GP/LP Timer', 'Timer'));
      record.fpu = /M4|M7|M33|M55/i.test(raw(core)) ? true : /8051|M0|M23/i.test(raw(core)) ? false : null;
      setInterfaceCounts(record, row);
      records.push(record);
    }
  }
  return records;
}

function parseMindMotion(fileName) {
  const markdown = readMarkdown(fileName);
  const records = [];
  const packagePattern = /\b(?:QFN|LQFP|TSSOP|SOP|SSOP|BGA|VFBGA|WLCSP|LGA|QFP)\d+[A-Z0-9]*\b/i;
  const temperaturePattern = /-?\d+\s*~\s*-?\d+\s*C/i;
  for (const line of markdown.split(/\r?\n/)) {
    const partMatch = line.match(/\b(MM32[A-Z0-9]+)\*?/i);
    if (!partMatch) continue;
    const part = partMatch[1].toUpperCase();
    const tokens = [...line.matchAll(/\S+/g)].map((match) => ({ value: match[0], index: match.index }));
    const partIndex = tokens.findIndex((token) => token.value.replace(/\*$/, '').toUpperCase() === part);
    if (partIndex < 0 || !tokens[partIndex + 4]) continue;
    const core = tokens[partIndex + 1]?.value;
    const frequency = tokens[partIndex + 2]?.value;
    const flash = tokens[partIndex + 3]?.value;
    const sram = tokens[partIndex + 4]?.value;
    if (!core || !/^(?:M\d+\+?|STAR-MC1)$/i.test(core) || !numberValue(frequency) || numberValue(flash) === null || numberValue(sram) === null) continue;
    const afterRam = tokens.slice(partIndex + 5);
    const gpioToken = afterRam.find((token) => /^\d+$/.test(token.value) && Number(token.value) >= 6) || afterRam.find((token) => /^\d+$/.test(token.value));
    const packageValue = line.match(packagePattern)?.[0] || '';
    const temperature = line.match(temperaturePattern)?.[0] || '';
    const adcMatch = line.match(/(?:,\s*)?(\d+)\s*ch\b/i);
    const record = createRecord({
      manufacturerId: 'mindmotion',
      partNumber: part,
      core,
      frequency,
      flash,
      sram,
      packageValue,
      gpio: gpioToken?.value,
      temperature,
      sourceName: `官方数据/${fileName}`,
      sourceNote: 'MindMotion 官方产品选型表 PDF 转 Markdown 后导入；仅读取带完整订货后缀的型号行，产品矩阵和系列汇总行未生成记录。',
      productUrl: 'https://www.mm32mcu.com/',
      datasheetUrl: 'https://www.mm32mcu.com/'
    });
    record.adc_channel_count = adcMatch ? Number(adcMatch[1]) : null;
    record.adc_resolution_bits = /12bit/i.test(line) ? 12 : null;
    record.fpu = /M4|M7|STAR-MC1/i.test(core) ? true : /M0|M0\+/i.test(core) ? false : null;
    record.usart_count = countValue(line.match(/\bU\(S\)ART\s*(\d+)/i)?.[1]);
    record.i2c_count = countValue(line.match(/\bI²C\s*(\d+)/i)?.[1]);
    record.spi_count = countValue(line.match(/\bSPI\s*(\d+)/i)?.[1]);
    record.i2s_count = countValue(line.match(/\bI²S\s*(\d+)/i)?.[1]);
    record.can_count = countValue(line.match(/\bCAN\s*(\d+)/i)?.[1]);
    record.usb = /\bUSB\b/i.test(line) ? true : null;
    record.segment_lcd = /segment\s*lcd/i.test(line) ? true : null;
    record.internal_opamp = /\bOpAmp\b/i.test(markdown) ? null : null;
    record.audio = /audio|I²S/i.test(line) ? true : null;
    record.zero_wait_flash = null;
    records.push(record);
  }
  return records;
}

function nationzBase({ part, core, frequency, flash, sram, voltage, temperature, packageValue, gpio, sourceName, sourceNote }) {
  const record = createRecord({
    manufacturerId: 'nationz', partNumber: part, core, frequency, flash, sram, voltage, temperature, packageValue, gpio,
    sourceName, sourceNote,
    productUrl: 'https://www.nationz.com.cn/', datasheetUrl: 'https://www.nationz.com.cn/'
  });
  record.timer_16bit_count = 1;
  record.timer_motor_control_count = 2;
  record.timer_basic_count = 1;
  record.timer_low_power_count = 1;
  record.timer_count = 5;
  record.usart_count = 2;
  record.lpuart_count = 1;
  record.spi_count = 2;
  record.i2s_count = 1;
  record.i2c_count = 2;
  record.rtc = true;
  record.opamp_count = 1;
  record.comparator_count = 1;
  record.internal_opamp = true;
  record.fpu = /M4/i.test(core);
  return record;
}

function parseNationzN32G031(fileName) {
  const sourceName = `官方数据/${fileName}`;
  const configs = [
    ['N32G031F8U7', 32, 16, 7, 'UFQFPN20'], ['N32G031F8S7', 32, 16, 9, 'TSSOP20'],
    ['N32G031K8Q7', 32, 28, 10, 'QFN32'], ['N32G031K8Q7-1', 32, 28, 10, 'QFN32'],
    ['N32G031K8L7', 32, 26, 10, 'LQFP32'], ['N32G031C8L7', 64, 40, 12, 'LQFP48'],
    ['N32G031F6U7', 32, 16, 7, 'UFQFPN20'], ['N32G031F6S7', 32, 16, 9, 'TSSOP20'],
    ['N32G031K6Q7', 32, 28, 10, 'QFN32'], ['N32G031K6Q7-1', 32, 28, 10, 'QFN32'],
    ['N32G031K6L7', 32, 26, 10, 'LQFP32']
  ];
  return configs.map(([part, flash, gpio, adc, packageValue]) => {
    const record = nationzBase({ part, core: 'M0', frequency: 48, flash, sram: 8, voltage: '1.8~5.5', temperature: '-40~105', packageValue, gpio, sourceName, sourceNote: 'Nationz N32G031 官方数据手册产品配置表导入；按封装和存储容量拆分为订货型号。' });
    record.adc_12bit_cell_count = 1;
    record.adc_12bit_channel_count = adc;
    record.adc_channel_count = adc;
    record.adc_resolution_bits = 12;
    record.audio = true;
    record.internal_oscillator = true;
    return record;
  });
}

function parseNationzN32G435(fileName) {
  const sourceName = `官方数据/${fileName}`;
  const configs = [
    ['N32G435G8Q7', 64, 16, 24, 'QFN28', 1, 2, 0, 0], ['N32G435GBQ7', 128, 32, 24, 'QFN28', 1, 2, 0, 0],
    ['N32G435K8L7', 64, 16, 26, 'LQFP32', 1, 2, 0, 0], ['N32G435KBL7', 128, 32, 26, 'LQFP32', 1, 2, 0, 0],
    ['N32G435C8L7', 64, 24, 38, 'LQFP48', 2, 3, 1, 1], ['N32G435CBL7', 128, 32, 38, 'LQFP48', 2, 3, 1, 1],
    ['N32G4352R8L7', 64, 24, 52, 'LQFP64', 2, 3, 1, 1], ['N32G435RBL7', 128, 32, 52, 'LQFP64', 2, 3, 1, 1],
    ['N32G435RBL7-1', 128, 32, 52, 'LQFP64', 2, 3, 1, 1]
  ];
  return configs.map(([part, flash, sram, gpio, packageValue, spi, usart, usb, can]) => {
    const record = nationzBase({ part, core: 'M4F', frequency: 108, flash, sram, voltage: '1.8~3.6', temperature: '-40~105', packageValue, gpio, sourceName, sourceNote: 'Nationz N32G435 官方数据手册产品配置表导入；按封装和 Flash 容量拆分为订货型号。' });
    record.usart_count = usart;
    record.spi_count = spi;
    record.i2s_count = spi;
    record.usb_device_count = usb;
    record.can_count = can;
    record.usb = usb > 0;
    record.can_count = can;
    record.adc_12bit_cell_count = 1;
    record.adc_12bit_channel_count = gpio >= 38 ? 16 : 10;
    record.adc_channel_count = record.adc_12bit_channel_count;
    record.adc_resolution_bits = 12;
    record.dac_channel_count = 1;
    record.dac_12bit_cell_count = 1;
    record.internal_oscillator = true;
    record.zero_wait_flash = true;
    return record;
  });
}

function parseWuxin(fileName) {
  const sourceName = `官方数据/${fileName}`;
  return ['CW32L012C8T6', 'CW32L012C8U6'].map((part) => {
    const record = createRecord({
      manufacturerId: 'wuxin', partNumber: part, core: 'M0+', frequency: 96, flash: 64, sram: 8,
      voltage: '1.7~5.5', temperature: '-40~85', packageValue: part.endsWith('T6') ? 'LQFP48' : 'QFN48', gpio: 40,
      sourceName, sourceNote: 'Wuxin CW32L012 官方数据手册产品功能列表导入；两个封装型号分别建立记录。',
      productUrl: 'https://www.whxy.com/', datasheetUrl: 'https://www.whxy.com/'
    });
    record.timer_16bit_count = 8;
    record.timer_count = 8;
    record.spi_count = 3;
    record.i2c_count = 2;
    record.uart_count = 3;
    record.adc_12bit_cell_count = 2;
    record.adc_12bit_channel_count = 12;
    record.adc_channel_count = 12;
    record.adc_resolution_bits = 12;
    record.dac_channel_count = 2;
    record.dac_12bit_cell_count = 2;
    record.comparator_count = 4;
    record.opamp_count = 2;
    record.internal_opamp = true;
    record.zero_wait_flash = true;
    record.internal_oscillator = true;
    record.reset_method = 'POR/BOR';
    record.interrupt_source_count = 32;
    record.rtc = true;
    record.iwdt = true;
    record.wwdt = true;
    record.watchdog = true;
    return record;
  });
}

function normalizeEssemiPart(value) {
  let part = raw(value).replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
  if (/^ES8S/.test(part)) part = part.replace(/^ES8S/, 'ES8H');
  if (/^ESS8P/.test(part)) part = part.replace(/^ESS8P/, 'ES8P');
  if (/^HR7PL/.test(part)) part = part.replace(/^HR7PL/, 'HR7P1');
  if (/^ES8H/.test(part)) part = part.replace(/O/g, '0');
  if (/^ES7P/.test(part)) part = part.replace(/O/g, '0');
  if (/^ES32/.test(part)) part = part.replace(/O/g, '0');
  if (/^ES32H0(?:584|S84|564)/.test(part)) part = part.replace(/^ES32H0(?:584|S84|564)/, 'ES32H0564');
  return part;
}

function parseEssemi(fileName) {
  const markdown = readMarkdown(fileName);
  const records = [];
  let currentCore = '8-bit MCU';
  for (const line of markdown.split(/\r?\n/)) {
    if (/32-bit ARM Cortex[- ]?M3/i.test(line)) currentCore = 'M3';
    else if (/32-bit ARM Cortex[- ]?M[O0]/i.test(line)) currentCore = 'M0';
    else if (/T-HEAD|RISC-V/i.test(line)) currentCore = 'RISC-V';
    else if (/8-bit/i.test(line)) currentCore = '8-bit MCU';
    const candidates = [...line.matchAll(/\b(?:HR7P|ES7P|ES8P|ES8H|ESS8P|ES32)[A-Z0-9]{4,18}/gi)]
      .map((match) => normalizeEssemiPart(match[0]))
      .filter((part) => !/[X*]$/i.test(part) && !/^(?:ES8H|ES7P|ES32)\d+[A-Z]?$/i.test(part));
    if (!candidates.length) continue;
    const packageMatch = line.match(/\b(?:QFN|LQFP|LOFP|LOQFP|TSSOP|SOP|SSOP|MSOP)\d+[A-Z0-9]*\b/i);
    if (!packageMatch) continue;
    const part = candidates.sort((left, right) => right.length - left.length)[0];
    const packageValue = packageMatch[0].toUpperCase().replace(/^LOQFP/, 'LQFP').replace(/^LOFP/, 'LQFP');
    const afterPackage = line.slice((packageMatch.index ?? 0) + packageMatch[0].length);
    const afterNumbers = [...afterPackage.matchAll(/\b\d+(?:\.\d+)?\b/g)].map((match) => Number(match[0]));
    const flashMatches = [...line.matchAll(/\b(\d+(?:\.\d+)?)\s*K(?:x|B)/gi)].map((match) => Number(match[1]));
    const voltageMatch = line.match(/(\d+(?:\.\d+)?)\s*~\s*(\d+(?:\.\d+)?)\s*V/i);
    const normalizeVoltage = (value) => Number(value) > 6 && Number(value) < 100 ? (Number(value) / 10).toFixed(1) : value;
    const voltage = voltageMatch ? `${normalizeVoltage(voltageMatch[1])}~${normalizeVoltage(voltageMatch[2])}` : '';
    let temperature = line.match(/-?\d+\s*°?C?\s*~\s*-?\d+\s*°?C/i)?.[0] || '';
    if (/^40\s*°?C/i.test(temperature) && /105\s*°?C/i.test(temperature)) temperature = `-${temperature}`;
    const frequency = line.match(/\b(\d+(?:\.\d+)?)\s*MHz/i)?.[1] || afterNumbers[3] || '';
    const flash = currentCore === '8-bit MCU' ? null : flashMatches[0] ?? afterNumbers[1] ?? null;
    const sram = currentCore === '8-bit MCU' ? null : flashMatches[1] ?? afterNumbers[2] ?? null;
    const gpio = afterNumbers[0] ?? null;
    const record = createRecord({
      manufacturerId: 'essemi', partNumber: part, core: currentCore, frequency, flash, sram,
      voltage, temperature, packageValue, gpio,
      sourceName: `官方数据/${fileName}`,
      sourceNote: 'Eastsoft ESSEMI 官方产品目录 PDF 经 OCR 转 Markdown，并对型号、封装和关键数字字段进行视觉复核；无法确认的专有功能保留为空。',
      productUrl: 'https://www.essemi.com/', datasheetUrl: 'https://www.essemi.com/'
    });
    record.internal_oscillator = /16MHz|32MHz|64MHz/i.test(line) ? true : null;
    record.audio = /audio|voice|beeper/i.test(line) ? true : null;
    record.infrared = /irda|infrared/i.test(line) ? true : null;
    record.segment_lcd = /\bLCD\b/i.test(line) ? true : null;
    record.usart_count = countValue(line.match(/\b(?:UART|USART)\s*(\d+)/i)?.[1]);
    record.adc_channel_count = countValue(line.match(/\b(?:ADC|通道数)\s*(\d+)/i)?.[1]);
    record.adc_resolution_bits = /12/i.test(line) ? 12 : null;
    records.push(record);
  }
  return records;
}

function parseSynwit(fileName) {
  const configs = [
    ['SWM181DBU6-40', 'M0', 48, 120, 16, 30, 'QFN40', '2.3~3.6'],
    ['SWM181C9T6-50', 'M0', 48, 96, 16, 38, 'LQFP48', '2.3~3.6'],
    ['SWM181CBT6-50', 'M0', 48, 120, 16, 38, 'LQFP48', '2.3~3.6'],
    ['SWM181RCT6-50', 'M0', 48, 248, 16, 50, 'LQFP64', '2.7~3.6'],
    ['SWM241KBT7-80', 'M0', 48, 128, 8, 28, 'LQFP32', '2.5~5.5'],
    ['SWM241PBT7-80', 'M0', 48, 128, 8, 40, 'LQFP44', '2.5~5.5'],
    ['SWM211C8T7-50', 'M0', 90, 64, 8, 43, 'LQFP48', '2.5~5.5'],
    ['SWM211G6S7-65', 'M0', 90, 32, 8, 24, 'SSOP28', '2.5~5.5'],
    ['SWM221CBT7-50', 'M0', 72, 128, 8, 36, 'LQFP48', '2.2~5.5'],
    ['SWM221EBS7-63', 'M0', 72, 128, 8, 20, 'SSOP24', '2.2~5.5'],
    ['SWM221KBU7-50', 'M0', 72, 128, 8, 27, 'QFN32', '2.2~5.5'],
    ['SWM221DBU7-40', 'M0', 72, 128, 8, 37, 'QFN40', '2.2~5.5'],
    ['SWM221GBS7-65', 'M0', 72, 128, 8, 24, 'SSOP28', '2.2~5.5'],
    ['SWM22PE8S7-63', 'M0', 72, 64, 8, 13, 'SSOP24', '2.2~5.5'],
    ['SWM22PG8S7-65', 'M0', 72, 64, 8, 15, 'SSOP28', '2.2~5.5'],
    ['SWM22DD8U7-40', 'M0', 72, 64, 8, 21, 'QFN40', '2.2~5.5'],
    ['SWM22DK8U7-40', 'M0', 72, 64, 8, 12, 'QFN32', '2.2~5.5'],
    ['SWM231E6S7-63', 'M0', 60, 32, 4, 22, 'SSOP24', '2.2~5.5'],
    ['SWM231F6U7-40', 'M0', 60, 32, 4, 19, 'QFN20', '2.2~5.5'],
    ['SWM23PE6S7-63', 'M0', 60, 32, 4, 14, 'SSOP24', '2.2~6.5'],
    ['SWM23DK6U7-40', 'M0', 60, 32, 4, 13, 'QFN32', '2.2~5.5'],
    ['SWM341CET7-50', 'M4', 150, 512, 64, 37, 'LQFP48', '3.0~3.6'],
    ['SWM341RET7-50', 'M4', 150, 512, 64, 51, 'LQFP64', '3.0~3.6'],
    ['SWM341VET7-50', 'M4', 150, 512, 64, 72, 'LQFP100', '3.0~3.6'],
    ['SWM34SCET6-50', 'M4', 120, 512, 64, 37, 'LQFP48', '3.0~3.6'],
    ['SWM34SRET6-50', 'M4', 140, 512, 64, 51, 'LQFP64', '3.0~3.6'],
    ['SWM34SMEU6-40', 'M4', 120, 512, 64, 60, 'QFN80', '3.0~3.6'],
    ['SWM34SVET6-50', 'M4', 140, 512, 64, 72, 'LQFP100', '3.0~3.6'],
    ['SWM330CGT7-50', 'M4', 140, 1024, 96, 41, 'LQFP48', '2.0~3.6'],
    ['SWM330RGU7-35', 'M4', 140, 1024, 96, 57, 'QFN68', '2.0~3.6'],
    ['SWM33SRGU6-35', 'M4', 140, 1024, 96, 57, 'QFN68', '2.0~3.6']
  ];
  const sourceName = `官方数据/${fileName}`;
  return configs.map(([part, core, frequency, flash, sram, gpio, packageValue, voltage]) => {
    const record = createRecord({
      manufacturerId: 'synwit', partNumber: part, core, frequency, flash, sram, voltage,
      packageValue, gpio, sourceName,
      sourceNote: 'Synwit 官方 MCU 产品目录 PDF 经 OCR 转 Markdown，并按目录图表视觉复核型号、封装和主参数；未确认字段保留为空。',
      productUrl: 'https://www.synwit.cn/', datasheetUrl: 'https://www.synwit.cn/'
    });
    record.usart_count = core === 'M4' ? 4 : 2;
    record.i2c_count = 2;
    record.spi_count = 2;
    record.adc_channel_count = core === 'M4' ? 12 : 12;
    record.adc_resolution_bits = 12;
    record.fpu = core === 'M4';
    record.internal_oscillator = true;
    return record;
  });
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
  const resetFields = (record.manufacturer_id === 'essemi' && record.core === '8-bit MCU') ||
    (record.manufacturer_id === 'wch' && /极简汇编/.test(record.source_note))
    ? new Set(['flash_kb', 'sram_kb'])
    : new Set();
  for (const field of Object.keys(schema.tables.mcus.fields)) {
    if (resetFields.has(field)) continue;
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
  if (format === 'wch') return parseWch;
  if (format === 'mindmotion-pdf') return parseMindMotion;
  if (format === 'nationz-n32g031-pdf') return parseNationzN32G031;
  if (format === 'nationz-n32g435-pdf') return parseNationzN32G435;
  if (format === 'wuxin-pdf') return parseWuxin;
  if (format === 'essemi-ocr') return parseEssemi;
  if (format === 'synwit-ocr') return parseSynwit;
  if (format === 'pdf-no-text' || format === 'pdf-family-overview') return () => [];
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
  .filter((row) => {
    const key = `${row.manufacturer_id}|${row.part_number.toUpperCase()}`;
    if (importedKeys.has(key)) return false;
    if (row.manufacturer_id === 'essemi' && importedKeys.has(`essemi|${normalizeEssemiPart(row.part_number)}`)) return false;
    return true;
  })
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
  ,['mindmotion', 'MindMotion Semiconductor', 'MindMotion', 'https://www.mm32mcu.com/', 'true']
  ,['nationz', 'Nationz Technologies', 'Nationz', 'https://www.nationz.com.cn/', 'true']
  ,['wuxin', 'Wuxin Microelectronics', 'Wuxin', 'https://www.whxy.com/', 'true']
  ,['wch', 'Nanjing Qinheng Microelectronics', 'WCH', 'https://www.wch.cn/', 'true']
  ,['essemi', 'Eastsoft Microelectronics', 'ESSEMI', 'https://www.essemi.com/', 'true']
  ,['synwit', 'Synwit Technology', 'Synwit', 'https://www.synwit.cn/', 'true']
].map((values) => Object.fromEntries(manufacturerHeaders.map((header, index) => [header, values[index]])));
const manufacturerById = new Map(manufacturerRows.map((row) => [row.manufacturer_id, row]));
for (const row of additions) if (!manufacturerById.has(row.manufacturer_id)) manufacturerById.set(row.manufacturer_id, row);
writeCsv(path.join(sourceDir, 'manufacturers.csv'), manufacturerHeaders, [...manufacturerById.values()]);

console.log(`Batch ${batchNumber}: imported ${importedByKey.size} records from ${selectedFiles.length} official files; retained ${retainedRows.length} existing records.`);
