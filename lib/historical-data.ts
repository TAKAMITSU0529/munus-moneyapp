/**
 * 過去20年間の全世界株式インデックス（MSCI ACWI）の実績データ
 * 2004年〜2024年の年末時点の指数値（2004年を100として正規化）
 * 
 * 実際のデータに基づいた近似値
 */
export const historicalIndexData = [
  { year: 2004, value: 100 },
  { year: 2005, value: 110 },
  { year: 2006, value: 125 },
  { year: 2007, value: 140 },
  { year: 2008, value: 85 },  // リーマンショック
  { year: 2009, value: 105 },
  { year: 2010, value: 115 },
  { year: 2011, value: 110 },
  { year: 2012, value: 125 },
  { year: 2013, value: 145 },
  { year: 2014, value: 150 },
  { year: 2015, value: 148 },
  { year: 2016, value: 158 },
  { year: 2017, value: 180 },
  { year: 2018, value: 170 },
  { year: 2019, value: 205 },
  { year: 2020, value: 215 },  // コロナショック後の回復
  { year: 2021, value: 245 },
  { year: 2022, value: 220 },
  { year: 2023, value: 260 },
  { year: 2024, value: 285 },
];

/**
 * 過去20年間の年平均リターン（約5.4%）
 */
export const historicalAverageReturn = 5.4;

/**
 * 重要なイベント
 */
export const historicalEvents = [
  { year: 2008, label: "リーマンショック", description: "一時的に大きく下落したが、その後回復" },
  { year: 2020, label: "コロナショック", description: "短期的な下落後、急速に回復" },
];
