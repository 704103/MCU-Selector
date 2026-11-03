# 数据维护流程

## 1. 权限模型

- 浏览者：访问 GitHub Pages，进行搜索、筛选和导出；
- 贡献者：通过 GitHub Issue 或 Pull Request 提交数据建议；
- 数据维护者：新增和修改源 CSV；
- 审核者：确认官方来源、参数和数据质量；
- `main` 分支：只接受审核后的 Pull Request，不直接修改。

网页端不保存 GitHub Token，也不允许浏览器直接写入仓库。

## 2. 新增型号

1. 查找官方产品页和数据手册。
2. 确认产品品牌、完整订货型号、封装和引脚数。
3. 在 `mcus.csv` 新增一行，并创建稳定的 `mcu_id`。
4. 将不适合主表的规格写入 `mcu_features.csv`。
5. 填写产品链接、数据手册链接、来源名称和核验日期。
6. 提交 Pull Request，说明新增范围和数据来源。
7. 等待自动校验和人工审核通过后合并。

样品价格和批量价格填写在 `sample_price`、`batch_price` 字段中，保留币种、数量、税费和有效期等条件；没有正式报价时留空，不根据官方技术资料估算。

## 3. 修改型号

1. 保留原有 `mcu_id`。
2. 只修改有依据的字段。
3. 在 Pull Request 描述中列出修改字段和原因。
4. 如果规格来自新版数据手册，填写新的核验日期并保留来源链接。
5. 不通过删除整行来隐藏错误或停产型号。

## 4. 停产和隐藏

停产型号设置：

```text
lifecycle_status = obsolete
```

如果网页默认不显示，再设置：

```text
visibility = hidden
```

数据错误或重复型号优先在 Pull Request 中修正。确实重复时，可以隐藏重复记录并在说明中指出保留的 `mcu_id`。

## 5. 用户提交

普通用户不直接修改 CSV。用户通过 Issue 表单提交：

- 厂商和型号；
- 产品品牌；
- 建议增加或修改的字段；
- 官方产品页面；
- 官方数据手册；
- 修改原因或补充说明。

维护者验证来源后，再把内容转成正式数据。

## 6. 自动校验

发布前必须检查：

- `mcu_id` 不重复；
- 厂商引用有效；
- 型号业务键不重复；
- 必填字段完整；
- 枚举值合法；
- 数值字段格式正确且不为负数；
- 最小值不大于最大值；
- URL 格式正确；
- 每条公开型号都有官方来源；
- 扩展表中的 `mcu_id` 存在于主表；
- 扩展参数只填写一个值字段。

自动校验失败时不得发布 GitHub Pages。

## 7. 批量维护

批量更新按厂商或产品系列拆分 Pull Request，避免一次修改范围过大。使用 Excel 编辑 CSV 时，型号、厂商 ID 和 `mcu_id` 必须设置为文本格式，保存为 UTF-8 CSV。

## 8. 导入官方选型表

`官方数据/产品数据_20261103100.xls` 和 `官方数据/Selection Guide_STM32.xlsx` 是批量导入源。更新官方文件后执行：

```text
npm ci
npm run import:official
npm run build:data
```

导入器会把 APM32 和 STM32 记录转换为 `data/source/mcus.csv`，同型号以官方表记录覆盖，旧表中官方文件未包含的型号保留。复合容量和接口数量会归一化为可筛选的数值，原始来源写入 `source_name` 和 `source_note`。重新导入时会保留已有的 `sample_price` 和 `batch_price`，避免技术资料更新覆盖商务报价。导入产生的重复型号会保留后出现的记录并输出警告，必须在合并前人工核对。

其他厂商资料使用按批次的适配器导入：

```text
npm run import:official:batch -- 1
npm run validate:data
npm run generate:data
```

每批 10 份资料对应一个提交。导入器按 `manufacturer_id + part_number` 合并，保留已有 `mcu_id` 和价格；同型号来自多个官方表时，以最后读取的表为技术字段候选，并在终端输出重复警告。批次、解析器和审核状态记录在 `data/source/import-manifest.json`。

PDF 资料先使用 `pdftotext` 生成 Markdown 中间文件，再使用 `pdftoppm` 渲染代表页检查表格布局；扫描型 PDF 只有在 OCR 后仍能确认型号级参数时才进入主表。不能从 PDF 确认到具体订货型号的家族总览只保留来源记录，不直接生成型号行。

批次 3 的 PDF 资料先使用 Poppler 转换并渲染，再使用 Tesseract OCR 处理 ESSEMI 和 Synwit 的扫描表格。OCR 结果保存为 `data/source/pdf-md/` 下的 Markdown 中间文件；ESSEMI 仅导入带封装的型号行，Synwit 的型号和主要配置经过目录图片复核。GD32 家族概览、Megawin 尚未完成型号级复核的资料只登记在 `data/source/import-manifest.json`，不生成主表记录。

批次 4 至批次 7 是官网 HTML 产品页。HTML 导入器按页面结构选择适配器：Espressif 读取选型表中的 PN、GPIO、RAM、Flash 和 PSRAM；Generalplus 读取产品详情链接中的型号；HPMicro 读取在线选型表的 `data-name` 型号；PADAUK 读取产品表的型号、IO、RAM、ADC 和 PWM；Bluetrum、Bouffalo Lab、Princeton、SyncMOS 和 WinnerMicro 读取产品卡片或型号文本。页面中的模块、开发板、导航项、系列名和登录后动态数据不作为订货型号。

HTML 快照只有产品入口或系列导航、没有可验证的完整订货型号时，批次清单仍记录文件、厂商、解析器和 `record_count = 0`，不生成家族级假记录。后续取得可访问的型号级官方页面后，只需为对应文件增加适配器并重新执行该批次；导入器会按 `manufacturer_id + part_number` 合并并保留已有价格。

HTML 批次命令：

```text
node scripts/import-official-batch.mjs 4
node scripts/import-official-batch.mjs 5
node scripts/import-official-batch.mjs 6
node scripts/import-official-batch.mjs 7
npm run build:data
```

批次 4 至 6 每批 10 个 HTML 文件，批次 7 为剩余 8 个 HTML 文件。每批完成后检查 `data/source/import-manifest.json` 的文件级数量和解析器，再提交对应批次。

## 9. 复核周期

- 新增型号：合并前必须核验；
- 活跃产品：建议至少每 6 个月复核一次；
- 稳定或停产产品：建议至少每 12 个月复核一次；
- 超过复核周期的记录设置为 `needs_review`，但不自动修改技术参数。

## 10. 发布和回滚

合并到 `main` 后，自动流程生成网页数据和搜索索引并部署 GitHub Pages。每次发布对应一个 Git 提交；发现错误时优先回滚对应提交或提交修正 Pull Request，不直接修改生成文件。
