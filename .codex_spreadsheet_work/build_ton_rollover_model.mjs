import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = "/Users/victorsim/Desktop/Projects/learn_more_v1.0";
const outputDir = path.join(root, "outputs", "ton_rollover_model");
const outputPath = path.join(outputDir, "TON_rolling_position_calculator.xlsx");

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("摘要");
const inputs = workbook.worksheets.add("参数");
const usdt = workbook.worksheets.add("U本位滚仓");
const coin = workbook.worksheets.add("币本位滚仓");
const riskBudget = workbook.worksheets.add("风险预算滚仓");
const sensitivity = workbook.worksheets.add("敏感性分析");
const checks = workbook.worksheets.add("检查");

const sheets = [dashboard, inputs, usdt, coin, riskBudget, sensitivity, checks];

const palette = {
  navy: "#12355B",
  blue: "#2563EB",
  lightBlue: "#DBEAFE",
  paleBlue: "#EFF6FF",
  slate: "#334155",
  softGray: "#F8FAFC",
  border: "#CBD5E1",
  green: "#DCFCE7",
  red: "#FEE2E2",
  yellow: "#FEF3C7",
  purple: "#F3E8FF",
  white: "#FFFFFF",
};

function setTitle(sheet, title, subtitle = "") {
  const titleRange = sheet.getRange("A1:J1");
  titleRange.values = [[title, "", "", "", "", "", "", "", "", ""]];
  titleRange.merge();
  titleRange.format = {
    fill: palette.navy,
    font: { name: "Aptos Display", size: 18, bold: true, color: palette.white },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange("A2:J2").values = [[subtitle, "", "", "", "", "", "", "", "", ""]];
  sheet.getRange("A2:J2").merge();
  sheet.getRange("A2:J2").format = {
    fill: palette.paleBlue,
    font: { name: "Aptos", size: 10, color: palette.slate },
    horizontalAlignment: "left",
    verticalAlignment: "center",
    wrapText: true,
  };
}

function styleGrid(sheet, rangeAddress) {
  sheet.getRange(rangeAddress).format = {
    font: { name: "Aptos", size: 10, color: "#0F172A" },
    borders: { preset: "all", style: "thin", color: palette.border },
    verticalAlignment: "center",
  };
}

function styleHeader(range) {
  range.format = {
    fill: palette.navy,
    font: { name: "Aptos", size: 10, bold: true, color: palette.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: palette.border },
  };
}

function styleSection(range, fill = palette.lightBlue) {
  range.format = {
    fill,
    font: { name: "Aptos", size: 11, bold: true, color: palette.navy },
    horizontalAlignment: "left",
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: palette.border },
  };
}

function inputStyle(range) {
  range.format = {
    fill: "#FFF2CC",
    font: { name: "Aptos", size: 10, color: "#0000FF" },
    borders: { preset: "all", style: "thin", color: palette.border },
    horizontalAlignment: "right",
  };
}

function formulaStyle(range) {
  range.format = {
    fill: palette.white,
    font: { name: "Aptos", size: 10, color: "#000000" },
    borders: { preset: "all", style: "thin", color: palette.border },
    horizontalAlignment: "right",
  };
}

for (const s of sheets) {
  s.showGridlines = false;
}

// Inputs
setTitle(inputs, "TON / TONX 滚仓试算参数", "黄色单元格为可改输入。模型用于杠杆滚仓的路径和风险试算，不构成投资建议。");
inputs.getRange("A4:D4").values = [["核心价格与仓位参数", "", "", ""]];
inputs.getRange("A4:D4").merge();
styleSection(inputs.getRange("A4:D4"));
inputs.getRange("A5:D29").values = [
  ["初始本金", 10000, "USDT", "用于两套模型的起始权益"],
  ["初始币价", 1.5, "USDT/TON", "第一段滚仓的起点价格"],
  ["目标币价", 40, "USDT/TON", "模型终点价格"],
  ["滚仓段数", 12, "段", "价格路径按几何等比切分"],
  ["目标杠杆", 2.5, "x", "每段开仓后把权益重新调到该杠杆"],
  ["最大容忍回撤", 0.35, "%", "希望从开仓价向下最多承受的回撤"],
  ["维持保证金率", 0.005, "%", "交易所档位参数，需按实际合约替换"],
  ["强平/保险缓冲", 0.003, "%", "用于模拟强平费、保险基金和规则差异"],
  ["单边交易费率", 0.0006, "%", "每次开仓和每次平仓各收一次"],
  ["单边滑点", 0.001, "%", "开多买贵、平多卖便宜的执行价折损"],
  ["每期资金费率", 0.0001, "%", "正数代表多头支付，负数代表多头收取"],
  ["每段资金费次数", 3, "次", "例如每 8 小时一次，持仓 24 小时为 3 次"],
  ["段内插针回撤", 0.2, "%", "每段内从开仓价向下的压力测试低点"],
  ["币本位合约面值", 1, "USD/张", "币本位逆向合约的简化面值"],
  ["默认滚仓最大行数", 24, "段", "表格预留段数"],
  ["当前价格路径", "几何等比", "", "EndPrice = 初始价 * (目标价/初始价)^(Step/滚仓段数)"],
  ["U本位最大安全杠杆", "", "x", "由最大回撤、维持保证金和强平缓冲反推"],
  ["币本位最大安全杠杆", "", "x", "币本位逆向合约因保证金币价同步下跌，安全杠杆更低"],
  ["现货最终倍数", "", "x", "目标币价 / 初始币价"],
  ["目标杠杆是否超限", "", "", "会同时检查 U 本位和币本位"],
  ["风险预算-单次保证金比例", 0.1, "%", "图中示例类似：总资金只拿 10% 做单次保证金"],
  ["风险预算-单笔合约杠杆", 10, "x", "图中示例类似：单笔使用 10 倍杠杆"],
  ["风险预算-单笔止损幅度", 0.02, "%", "图中示例类似：2% 止损"],
  ["风险预算-加仓触发涨幅", 0.1, "%", "价格每上涨该幅度，模型新增一笔趋势仓"],
  ["风险预算-最大加仓次数", 8, "次", "风险预算滚仓页预留 12 次，默认只启用前 8 次"],
];
inputs.getRange("B21:B24").formulas = [
  ["=1/(1-(1-B10)*(1-B11-B12))"],
  ["=(1-B10)/(B10+B11+B12)"],
  ["=B7/B6"],
  ['=IF(OR(B9>B21,B9>B22),"检查杠杆","OK")'],
];
styleGrid(inputs, "A5:D29");
inputStyle(inputs.getRange("B5:B19"));
inputStyle(inputs.getRange("B25:B29"));
formulaStyle(inputs.getRange("B21:B24"));
inputs.getRange("B10:B16").format.numberFormat = "0.00%";
inputs.getRange("B25:B25").format.numberFormat = "0.00%";
inputs.getRange("B27:B28").format.numberFormat = "0.00%";
inputs.getRange("B21:B23").format.numberFormat = "0.00x";
inputs.getRange("A31:D31").values = [["颜色约定", "", "", ""]];
inputs.getRange("A31:D31").merge();
styleSection(inputs.getRange("A31:D31"), palette.purple);
inputs.getRange("A32:D35").values = [
  ["蓝色字体 + 黄色底", "用户输入", "", "可按交易所实际费率、维持保证金、资金费率修改"],
  ["黑色字体", "公式", "", "模型计算项"],
  ["绿色状态", "OK", "", "没有触发对应检查"],
  ["红色/黄色状态", "风险提示", "", "杠杆、插针或强平缓冲需要复核"],
];
styleGrid(inputs, "A32:D35");

// USDT model
setTitle(usdt, "U本位滚仓明细", "线性 USDT 保证金模型：盈亏以 USDT 结算。强平价使用简化公式，实际以交易所标记价格和档位为准。");
const usdtHeaders = [
  "Step", "起始价", "目标/结束价", "开仓执行价", "平仓执行价", "期初权益",
  "名义仓位", "持币数量", "开仓费", "资金费", "毛盈亏", "平仓费",
  "期末权益", "滚仓倍数", "估算强平价", "段内插针低点", "强平缓冲", "状态"
];
usdt.getRange("A4:R4").values = [usdtHeaders];
styleHeader(usdt.getRange("A4:R4"));
const usdtRows = [];
for (let i = 0; i < 24; i++) {
  const r = 5 + i;
  const prev = r - 1;
  usdtRows.push([
    `=IF(ROW()-4<='参数'!$B$8,ROW()-4,"")`,
    `=IF($A${r}="","",IF($A${r}=1,'参数'!$B$6,C${prev}))`,
    `=IF($A${r}="","",'参数'!$B$6*('参数'!$B$7/'参数'!$B$6)^($A${r}/'参数'!$B$8))`,
    `=IF($A${r}="","",B${r}*(1+'参数'!$B$14))`,
    `=IF($A${r}="","",C${r}*(1-'参数'!$B$14))`,
    `=IF($A${r}="","",IF($A${r}=1,'参数'!$B$5,M${prev}))`,
    `=IF($A${r}="","",F${r}*'参数'!$B$9)`,
    `=IF($A${r}="","",G${r}/D${r})`,
    `=IF($A${r}="","",G${r}*'参数'!$B$13)`,
    `=IF($A${r}="","",G${r}*'参数'!$B$15*'参数'!$B$16)`,
    `=IF($A${r}="","",H${r}*(E${r}-D${r}))`,
    `=IF($A${r}="","",H${r}*E${r}*'参数'!$B$13)`,
    `=IF($A${r}="","",MAX(0,F${r}+K${r}-I${r}-J${r}-L${r}))`,
    `=IF($A${r}="","",M${r}/F${r})`,
    `=IF($A${r}="","",D${r}*(1-1/'参数'!$B$9)/(1-'参数'!$B$11-'参数'!$B$12))`,
    `=IF($A${r}="","",B${r}*(1-'参数'!$B$17))`,
    `=IF($A${r}="","",P${r}/O${r}-1)`,
    `=IF($A${r}="","",IF(P${r}<=O${r},"插针触发强平","OK"))`,
  ]);
}
usdt.getRange("A5:R28").formulas = usdtRows;
styleGrid(usdt, "A5:R28");
usdt.getRange("B5:G28").format.numberFormat = "$0.0000";
usdt.getRange("H5:H28").format.numberFormat = "#,##0.0000";
usdt.getRange("I5:M28").format.numberFormat = "$#,##0;[Red]($#,##0);-";
usdt.getRange("N5:N28").format.numberFormat = "0.00x";
usdt.getRange("O5:P28").format.numberFormat = "$0.0000";
usdt.getRange("Q5:Q28").format.numberFormat = "0.0%";
usdt.getRange("R5:R28").conditionalFormats.add("containsText", {
  text: "OK",
  format: { fill: palette.green, font: { color: "#166534", bold: true } },
});
usdt.getRange("R5:R28").conditionalFormats.add("containsText", {
  text: "强平",
  format: { fill: palette.red, font: { color: "#991B1B", bold: true } },
});

// Coin margined model
setTitle(coin, "币本位滚仓明细", "币本位逆向合约模型：保证金和盈亏以 TON 计，最终再按价格折算 USDT。下跌时保证金币价同步缩水，因此同等杠杆的强平距离通常比 U 本位更近。");
const coinHeaders = [
  "Step", "起始价", "目标/结束价", "开仓执行价", "平仓执行价", "期初权益 TON",
  "期初权益 USDT", "名义仓位 USD", "合约张数", "开仓费 TON", "资金费 TON", "毛盈亏 TON",
  "平仓费 TON", "期末权益 TON", "期末权益 USDT", "滚仓倍数", "估算强平价", "段内插针低点", "强平缓冲", "状态"
];
coin.getRange("A4:T4").values = [coinHeaders];
styleHeader(coin.getRange("A4:T4"));
const coinRows = [];
for (let i = 0; i < 24; i++) {
  const r = 5 + i;
  const prev = r - 1;
  coinRows.push([
    `=IF(ROW()-4<='参数'!$B$8,ROW()-4,"")`,
    `=IF($A${r}="","",IF($A${r}=1,'参数'!$B$6,C${prev}))`,
    `=IF($A${r}="","",'参数'!$B$6*('参数'!$B$7/'参数'!$B$6)^($A${r}/'参数'!$B$8))`,
    `=IF($A${r}="","",B${r}*(1+'参数'!$B$14))`,
    `=IF($A${r}="","",C${r}*(1-'参数'!$B$14))`,
    `=IF($A${r}="","",IF($A${r}=1,'参数'!$B$5/'参数'!$B$6,N${prev}))`,
    `=IF($A${r}="","",F${r}*B${r})`,
    `=IF($A${r}="","",G${r}*'参数'!$B$9)`,
    `=IF($A${r}="","",H${r}/'参数'!$B$18)`,
    `=IF($A${r}="","",H${r}*'参数'!$B$13/D${r})`,
    `=IF($A${r}="","",H${r}*'参数'!$B$15*'参数'!$B$16/((D${r}+E${r})/2))`,
    `=IF($A${r}="","",H${r}*(1/D${r}-1/E${r}))`,
    `=IF($A${r}="","",H${r}*'参数'!$B$13/E${r})`,
    `=IF($A${r}="","",MAX(0,F${r}+L${r}-J${r}-K${r}-M${r}))`,
    `=IF($A${r}="","",N${r}*C${r})`,
    `=IF($A${r}="","",O${r}/G${r})`,
    `=IF($A${r}="","",H${r}*(1+'参数'!$B$11+'参数'!$B$12)/(F${r}+H${r}/D${r}))`,
    `=IF($A${r}="","",B${r}*(1-'参数'!$B$17))`,
    `=IF($A${r}="","",R${r}/Q${r}-1)`,
    `=IF($A${r}="","",IF(R${r}<=Q${r},"插针触发强平","OK"))`,
  ]);
}
coin.getRange("A5:T28").formulas = coinRows;
styleGrid(coin, "A5:T28");
coin.getRange("B5:E28").format.numberFormat = "$0.0000";
coin.getRange("F5:F28").format.numberFormat = "#,##0.0000";
coin.getRange("G5:H28").format.numberFormat = "$#,##0;[Red]($#,##0);-";
coin.getRange("I5:I28").format.numberFormat = "#,##0";
coin.getRange("J5:N28").format.numberFormat = "#,##0.0000";
coin.getRange("O5:O28").format.numberFormat = "$#,##0;[Red]($#,##0);-";
coin.getRange("P5:P28").format.numberFormat = "0.00x";
coin.getRange("Q5:R28").format.numberFormat = "$0.0000";
coin.getRange("S5:S28").format.numberFormat = "0.0%";
coin.getRange("T5:T28").conditionalFormats.add("containsText", {
  text: "OK",
  format: { fill: palette.green, font: { color: "#166534", bold: true } },
});
coin.getRange("T5:T28").conditionalFormats.add("containsText", {
  text: "强平",
  format: { fill: palette.red, font: { color: "#991B1B", bold: true } },
});

// Risk-budget rolling / pyramiding model
setTitle(riskBudget, "风险预算式滚仓", "对应你图里的口径：趋势中只拿总权益的一部分作为单次保证金，单笔止损控制总资金风险；上涨后再加趋势仓，并观察旧仓浮盈能否覆盖新仓风险。");
riskBudget.getRange("A4:S4").values = [[
  "加仓次序", "触发/开仓价", "开仓执行价", "期初权益", "单次保证金", "单笔杠杆",
  "新增名义仓位", "新增持币数", "开仓费", "累计持币数", "累计开仓费",
  "组合名义仓位", "组合杠杆", "新仓止损价", "新仓风险额", "新仓风险/权益",
  "旧仓浮盈", "目标价权益", "状态"
]];
styleHeader(riskBudget.getRange("A4:S4"));
const rbRows = [];
for (let i = 0; i < 12; i++) {
  const r = 5 + i;
  const prev = r - 1;
  const prevRange = i === 0 ? "" : `$H$5:H${prev}`;
  const prevEntryRange = i === 0 ? "" : `$C$5:C${prev}`;
  const currRange = `$H$5:H${r}`;
  const currEntryRange = `$C$5:C${r}`;
  rbRows.push([
    `=IF(ROW()-4<='参数'!$B$29,ROW()-4,"")`,
    `=IF($A${r}="","",'参数'!$B$6*(1+'参数'!$B$28)^($A${r}-1))`,
    `=IF($A${r}="","",B${r}*(1+'参数'!$B$14))`,
    i === 0
      ? `=IF($A${r}="","",'参数'!$B$5)`
      : `=IF($A${r}="","",'参数'!$B$5+SUMPRODUCT(${prevRange},B${r}-${prevEntryRange})-K${prev})`,
    `=IF($A${r}="","",D${r}*'参数'!$B$25)`,
    `=IF($A${r}="","",'参数'!$B$26)`,
    `=IF($A${r}="","",E${r}*F${r})`,
    `=IF($A${r}="","",G${r}/C${r})`,
    `=IF($A${r}="","",G${r}*'参数'!$B$13)`,
    `=IF($A${r}="","",SUM($H$5:H${r}))`,
    `=IF($A${r}="","",SUM($I$5:I${r}))`,
    `=IF($A${r}="","",J${r}*B${r})`,
    `=IF($A${r}="","",L${r}/MAX(1,D${r}))`,
    `=IF($A${r}="","",C${r}*(1-'参数'!$B$27))`,
    `=IF($A${r}="","",H${r}*(C${r}-N${r})+H${r}*N${r}*'参数'!$B$13+I${r})`,
    `=IF($A${r}="","",O${r}/D${r})`,
    i === 0
      ? `=IF($A${r}="","",0)`
      : `=IF($A${r}="","",SUMPRODUCT(${prevRange},B${r}-${prevEntryRange})-K${prev})`,
    `=IF($A${r}="","",'参数'!$B$5+SUMPRODUCT(${currRange},'参数'!$B$7-${currEntryRange})-K${r}-SUMPRODUCT(${currRange},'参数'!$B$7)*'参数'!$B$13)`,
    `=IF($A${r}="","",IF(P${r}>0.03,"风险偏高",IF(Q${r}<O${r},"旧仓浮盈不足","OK")))`,
  ]);
}
riskBudget.getRange("A5:S16").formulas = rbRows;
styleGrid(riskBudget, "A5:S16");
riskBudget.getRange("B5:C16").format.numberFormat = "$0.0000";
riskBudget.getRange("D5:G16").format.numberFormat = "$#,##0;[Red]($#,##0);-";
riskBudget.getRange("H5:H16").format.numberFormat = "#,##0.0000";
riskBudget.getRange("I5:L16").format.numberFormat = "$#,##0;[Red]($#,##0);-";
riskBudget.getRange("M5:M16").format.numberFormat = "0.00x";
riskBudget.getRange("N5:N16").format.numberFormat = "$0.0000";
riskBudget.getRange("O5:O16").format.numberFormat = "$#,##0;[Red]($#,##0);-";
riskBudget.getRange("P5:P16").format.numberFormat = "0.0%";
riskBudget.getRange("Q5:R16").format.numberFormat = "$#,##0;[Red]($#,##0);-";
riskBudget.getRange("A19:S19").values = [["定义说明", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]];
riskBudget.getRange("A19:S19").merge();
styleSection(riskBudget.getRange("A19:S19"), palette.yellow);
riskBudget.getRange("A20:S24").values = [
  ["这个页的“滚仓”不是每次把全部权益打满目标杠杆，而是把总权益拆成多笔风险预算。每次只投入一小部分保证金，单笔亏损用止损幅度控制。", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["例如总资金 5W，单次保证金 10%，单笔 10x，则新增名义仓位约等于总资金 1x；如果止损 2%，单笔风险约为总资金 2% 加手续费和滑点。", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["趋势上涨后继续加仓，旧仓浮盈变成缓冲；如果旧仓浮盈能覆盖新仓止损风险，组合的“本金风险”会下降，但尾部回撤和插针风险仍然存在。", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["这个模式更接近你截图里的定义；U本位滚仓和币本位滚仓页则是“目标组合杠杆再平衡”模型，收益更激进，风险也更集中。", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["真实执行还要决定：加仓触发条件、旧仓止损是否推到成本价、突破失败时是否减掉加仓仓位、是否用收盘价确认而不是盘中价格。", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
];
riskBudget.getRange("A20:S24").merge(false);
riskBudget.getRange("A20:S24").format = {
  fill: palette.softGray,
  font: { name: "Aptos", size: 10, color: palette.slate },
  wrapText: true,
  borders: { preset: "all", style: "thin", color: palette.border },
  verticalAlignment: "top",
};
riskBudget.getRange("S5:S16").conditionalFormats.add("containsText", {
  text: "OK",
  format: { fill: palette.green, font: { color: "#166534", bold: true } },
});
riskBudget.getRange("S5:S16").conditionalFormats.add("containsText", {
  text: "风险",
  format: { fill: palette.yellow, font: { color: "#92400E", bold: true } },
});
riskBudget.getRange("S5:S16").conditionalFormats.add("containsText", {
  text: "不足",
  format: { fill: palette.red, font: { color: "#991B1B", bold: true } },
});

// Sensitivity
setTitle(sensitivity, "敏感性分析", "不同滚仓段数和目标杠杆下的最终本金倍数。已纳入手续费、滑点和资金费；强平风险需同时看检查项。");
sensitivity.getRange("A4:G4").values = [["U本位：最终本金倍数", 1, 1.5, 2, 2.5, 2.86, "备注"]];
styleHeader(sensitivity.getRange("A4:G4"));
sensitivity.getRange("B4:F4").format.numberFormat = "0.00x";
sensitivity.getRange("A5:A11").values = [[1], [2], [4], [8], [12], [18], [24]];
sensitivity.getRange("A5:A11").format.numberFormat = '0 "段"';
sensitivity.getRange("B5:F11").formulas = Array.from({ length: 7 }, (_, rr) => {
  const row = 5 + rr;
  return Array.from({ length: 5 }, (_, cc) => {
    const col = String.fromCharCode("B".charCodeAt(0) + cc);
    return `=MAX(0,(1+${col}$4*(('参数'!$B$7/'参数'!$B$6)^(1/$A${row})*(1-'参数'!$B$14)/(1+'参数'!$B$14)-1)-${col}$4*'参数'!$B$13-${col}$4*(('参数'!$B$7/'参数'!$B$6)^(1/$A${row})*(1-'参数'!$B$14)/(1+'参数'!$B$14))*'参数'!$B$13-${col}$4*'参数'!$B$15*'参数'!$B$16)^$A${row})`;
  });
});
sensitivity.getRange("G5:G11").formulas = Array.from({ length: 7 }, (_, rr) => {
  const row = 5 + rr;
  return [`=IF(F$4>'参数'!$B$21,"2.86x 可能超过U本位安全杠杆","")`];
});
styleGrid(sensitivity, "A5:G11");
sensitivity.getRange("B5:F11").format.numberFormat = "0.0x";
sensitivity.getRange("A13:G13").values = [["币本位：最终本金倍数", 1, 1.5, 2, 2.5, 2.86, "备注"]];
styleHeader(sensitivity.getRange("A13:G13"));
sensitivity.getRange("B13:F13").format.numberFormat = "0.00x";
sensitivity.getRange("A14:A20").values = [[1], [2], [4], [8], [12], [18], [24]];
sensitivity.getRange("A14:A20").format.numberFormat = '0 "段"';
sensitivity.getRange("H13:H13").values = [["每段价格倍数"]];
styleHeader(sensitivity.getRange("H13:H13"));
sensitivity.getRange("H14:H20").formulas = Array.from({ length: 7 }, (_, rr) => {
  const row = 14 + rr;
  return [`=('参数'!$B$7/'参数'!$B$6)^(1/$A${row})`];
});
sensitivity.getRange("H14:H20").format.numberFormat = "0.000x";
sensitivity.getRange("B14:F20").formulas = Array.from({ length: 7 }, (_, rr) => {
  const row = 14 + rr;
  return Array.from({ length: 5 }, (_, cc) => {
    const col = String.fromCharCode("B".charCodeAt(0) + cc);
    return `=MAX(0,((1+${col}$13*(1/(1+'参数'!$B$14)-1/($H${row}*(1-'参数'!$B$14)))-${col}$13*'参数'!$B$13/(1+'参数'!$B$14)-${col}$13*'参数'!$B$13/($H${row}*(1-'参数'!$B$14))-${col}$13*'参数'!$B$15*'参数'!$B$16*2/(1+$H${row}))*$H${row})^$A${row})`;
  });
});
sensitivity.getRange("G14:G20").formulas = Array.from({ length: 7 }, () => {
  return [`=IF(F$13>'参数'!$B$22,"2.86x 通常超过币本位安全杠杆","")`];
});
styleGrid(sensitivity, "A14:G20");
sensitivity.getRange("B14:F20").format.numberFormat = "0.0x";
sensitivity.getRange("B5:F11").conditionalFormats.add("colorScale", {
  criteria: [
    { type: "lowestValue", color: "#FCA5A5" },
    { type: "percentile", value: 50, color: "#FDE68A" },
    { type: "highestValue", color: "#86EFAC" },
  ],
});
sensitivity.getRange("B14:F20").conditionalFormats.add("colorScale", {
  criteria: [
    { type: "lowestValue", color: "#FCA5A5" },
    { type: "percentile", value: 50, color: "#FDE68A" },
    { type: "highestValue", color: "#86EFAC" },
  ],
});

// Dashboard
setTitle(dashboard, "TON 滚仓收益与强平风险摘要", "默认案例：1.5 -> 40，滚仓 12 段，目标杠杆 2.5x。请先在“参数”页替换为真实交易所参数。");
dashboard.getRange("A4:D4").values = [["核心结果", "", "", ""]];
dashboard.getRange("A4:D4").merge();
styleSection(dashboard.getRange("A4:D4"));
dashboard.getRange("A5:D13").values = [
  ["现货最终倍数", "", "x", "不加杠杆，仅价格上涨"],
  ["U本位最终权益", "", "USDT", "来自 U本位滚仓最后一段"],
  ["U本位最终倍数", "", "x", "最终权益 / 初始本金"],
  ["U本位估算强平次数", "", "次", "段内插针低点低于估算强平价"],
  ["U本位最大安全杠杆", "", "x", "可承受参数页最大回撤的理论上限"],
  ["币本位最终权益", "", "USDT", "来自币本位滚仓最后一段"],
  ["币本位最终倍数", "", "x", "最终权益 / 初始本金"],
  ["币本位估算强平次数", "", "次", "段内插针低点低于估算强平价"],
  ["币本位最大安全杠杆", "", "x", "币本位逆向合约的理论上限"],
  ["风险预算滚仓目标权益", "", "USDT", "来自风险预算滚仓最后一笔加仓后的目标价权益"],
  ["风险预算滚仓最终倍数", "", "x", "目标价权益 / 初始本金"],
];
dashboard.getRange("B5:B15").formulas = [
  ["='参数'!B23"],
  ["=LOOKUP(2,1/('U本位滚仓'!A5:A28<>\"\"),'U本位滚仓'!M5:M28)"],
  ["=B6/'参数'!B5"],
  ['=COUNTIF(\'U本位滚仓\'!R5:R28,"*强平*")'],
  ["='参数'!B21"],
  ["=LOOKUP(2,1/('币本位滚仓'!A5:A28<>\"\"),'币本位滚仓'!O5:O28)"],
  ["=B10/'参数'!B5"],
  ['=COUNTIF(\'币本位滚仓\'!T5:T28,"*强平*")'],
  ["='参数'!B22"],
  ["=LOOKUP(2,1/('风险预算滚仓'!A5:A16<>\"\"),'风险预算滚仓'!R5:R16)"],
  ["=B14/'参数'!B5"],
];
styleGrid(dashboard, "A5:D15");
formulaStyle(dashboard.getRange("B5:B15"));
dashboard.getRange("B5:B5").format.numberFormat = "0.0x";
dashboard.getRange("B6:B6").format.numberFormat = "$#,##0";
dashboard.getRange("B7:B7").format.numberFormat = "0.0x";
dashboard.getRange("B8:B8").format.numberFormat = "0";
dashboard.getRange("B9:B9").format.numberFormat = "0.00x";
dashboard.getRange("B10:B10").format.numberFormat = "$#,##0";
dashboard.getRange("B11:B11").format.numberFormat = "0.0x";
dashboard.getRange("B12:B12").format.numberFormat = "0";
dashboard.getRange("B13:B13").format.numberFormat = "0.00x";
dashboard.getRange("B14:B14").format.numberFormat = "$#,##0";
dashboard.getRange("B15:B15").format.numberFormat = "0.0x";
dashboard.getRange("F4:J4").values = [["风险解释", "", "", "", ""]];
dashboard.getRange("F4:J4").merge();
styleSection(dashboard.getRange("F4:J4"), palette.yellow);
dashboard.getRange("F5:J11").values = [
  ["1", "U本位强平距离", "线性合约近似：强平价 = 开仓执行价 * (1 - 1/杠杆) / (1 - 维持保证金 - 强平缓冲)", "", ""],
  ["2", "币本位强平距离", "逆向币本位中，保证金以币计价；币价下跌会让保证金 USD 价值同步下降，所以同等杠杆更容易爆仓。", "", ""],
  ["3", "资金费率", "正数代表多头支付，负数代表多头收取。模型按每段固定次数计提。", "", ""],
  ["4", "滑点", "开仓执行价按更高价格，平仓执行价按更低价格，模拟买卖价差和冲击成本。", "", ""],
  ["5", "插针", "每段内假设先出现一次向下插针；即便最终价格上涨，也可能先触发强平。", "", ""],
  ["6", "TONX", "上市公司持币代理还会受到 NAV 溢价/折价、融资稀释、监管和股票流动性影响，本表只建模底层币/合约滚仓。", "", ""],
  ["7", "现实差异", "真实强平价还受交易所档位、标记价格、自动减仓、保险基金和风控规则影响。", "", ""],
];
dashboard.getRange("F5:J11").merge(false);
styleGrid(dashboard, "F5:J11");
dashboard.getRange("F5:J11").format.wrapText = true;

dashboard.getRange("A18:F18").values = [["图表数据", "现货", "U本位", "币本位", "风险预算", ""]];
styleHeader(dashboard.getRange("A18:F18"));
dashboard.getRange("A19:E19").values = [["最终倍数", "", "", "", ""]];
dashboard.getRange("B19:E19").formulas = [["=B5", "=B7", "=B11", "=B15"]];
dashboard.getRange("B19:E19").format.numberFormat = "0.0x";
styleGrid(dashboard, "A19:E19");
dashboard.charts.add("ColumnClustered", {
  title: "最终本金倍数对比",
  categories: ["现货", "U本位", "币本位", "风险预算"],
  series: [{ name: "最终倍数", values: ["='摘要'!B19", "='摘要'!C19", "='摘要'!D19", "='摘要'!E19"] }],
  hasLegend: false,
  from: { row: 17, col: 5 },
  extent: { widthPx: 520, heightPx: 300 },
  dataLabels: { showValue: true, position: "outEnd" },
});

// Checks
setTitle(checks, "模型检查", "这些检查用于提示输入和风险状态，不代表交易所强平价的精确保证。");
checks.getRange("A4:F4").values = [["检查项", "实际值", "阈值/期望", "差异", "状态", "备注"]];
styleHeader(checks.getRange("A4:F4"));
checks.getRange("A5:F12").values = [
  ["初始价格 > 0", "", ">0", "", "", ""],
  ["目标价格 > 初始价格", "", ">初始价格", "", "", ""],
  ["滚仓段数在预留范围内", "", "<= 默认最大行数", "", "", ""],
  ["U本位杠杆不超过安全上限", "", "", "", "", "若为 WARN，35% 回撤目标下可能先爆仓"],
  ["币本位杠杆不超过安全上限", "", "", "", "", "币本位安全杠杆通常低于 U 本位"],
  ["U本位插针未触发强平", "", "0 次", "", "", ""],
  ["币本位插针未触发强平", "", "0 次", "", "", ""],
  ["资金费方向已确认", "", "正数=多头支付", "", "", "如果预期多头收取资金费，把参数页资金费率改为负数"],
  ["风险预算单笔风险不超过 3%", "", "<=3%", "", "", "图中 10% 保证金、10x、2% 止损约等于总资金 2% 风险，手续费滑点会略提高"],
];
checks.getRange("B5:E13").formulas = [
  ["='参数'!B6", "=\">0\"", "=B5", '=IF(B5>0,"OK","FAIL")'],
  ["='参数'!B7", "='参数'!B6", "=B6-C6", '=IF(B6>C6,"OK","FAIL")'],
  ["='参数'!B8", "='参数'!B19", "=B7-C7", '=IF(B7<=C7,"OK","FAIL")'],
  ["='参数'!B9", "='参数'!B21", "=B8-C8", '=IF(B8<=C8,"OK","WARN")'],
  ["='参数'!B9", "='参数'!B22", "=B9-C9", '=IF(B9<=C9,"OK","WARN")'],
  ['=COUNTIF(\'U本位滚仓\'!R5:R28,"*强平*")', "=0", "=B10-C10", '=IF(B10=0,"OK","WARN")'],
  ['=COUNTIF(\'币本位滚仓\'!T5:T28,"*强平*")', "=0", "=B11-C11", '=IF(B11=0,"OK","WARN")'],
  ["='参数'!B15", "\"已输入\"", "", '=IF(ISNUMBER(B12),"OK","FAIL")'],
  ["=MAX('风险预算滚仓'!P5:P16)", "=3%", "=B13-C13", '=IF(B13<=C13,"OK","WARN")'],
];
styleGrid(checks, "A5:F13");
checks.getRange("B5:D13").format.numberFormat = "0.0000";
checks.getRange("B13:D13").format.numberFormat = "0.0%";
checks.getRange("E5:E13").conditionalFormats.add("containsText", {
  text: "OK",
  format: { fill: palette.green, font: { color: "#166534", bold: true } },
});
checks.getRange("E5:E13").conditionalFormats.add("containsText", {
  text: "WARN",
  format: { fill: palette.yellow, font: { color: "#92400E", bold: true } },
});
checks.getRange("E5:E13").conditionalFormats.add("containsText", {
  text: "FAIL",
  format: { fill: palette.red, font: { color: "#991B1B", bold: true } },
});

// Layout polish
for (const s of sheets) {
  s.getRange("A1:T40").format.font = { name: "Aptos", size: 10 };
  try {
    s.getRange("A:T").format.autofitColumns();
    s.getRange("1:40").format.autofitRows();
  } catch {
    // Some renderers do not support whole-column autofit. Fixed widths below cover the key sheets.
  }
}

inputs.getRange("A:A").format.columnWidth = 190;
inputs.getRange("B:B").format.columnWidth = 120;
inputs.getRange("C:C").format.columnWidth = 90;
inputs.getRange("D:D").format.columnWidth = 360;
dashboard.getRange("A:A").format.columnWidth = 180;
dashboard.getRange("B:B").format.columnWidth = 130;
dashboard.getRange("C:C").format.columnWidth = 80;
dashboard.getRange("D:D").format.columnWidth = 330;
dashboard.getRange("F:F").format.columnWidth = 40;
dashboard.getRange("G:G").format.columnWidth = 150;
dashboard.getRange("H:H").format.columnWidth = 520;
usdt.getRange("A:R").format.columnWidth = 110;
coin.getRange("A:T").format.columnWidth = 110;
riskBudget.getRange("A:S").format.columnWidth = 112;
riskBudget.getRange("A:A").format.columnWidth = 90;
riskBudget.getRange("S:S").format.columnWidth = 110;
sensitivity.getRange("A:G").format.columnWidth = 120;
sensitivity.getRange("H:H").format.columnWidth = 120;
checks.getRange("A:A").format.columnWidth = 220;
checks.getRange("F:F").format.columnWidth = 420;

// Verification snippets
const dashCheck = await workbook.inspect({
  kind: "table",
  range: "摘要!A4:D13",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 6,
});
console.log(dashCheck.ndjson);
const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errorScan.ndjson);

for (const item of [
  ["摘要", "A1:J22"],
  ["参数", "A1:D30"],
  ["U本位滚仓", "A1:L18"],
  ["币本位滚仓", "A1:L18"],
  ["风险预算滚仓", "A1:L24"],
  ["敏感性分析", "A1:G22"],
  ["检查", "A1:F14"],
]) {
  const [sheetName, range] = item;
  const blob = await workbook.render({ sheetName, range, scale: 0.75 });
  console.log(`rendered ${sheetName} ${range} ${blob.size ?? ""}`);
}

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
