#!/usr/bin/env python3
"""
Las Vegas 疫苗批次分发分析脚本
分析 Las Vegas 地区的疫苗批次分配和不良反应情况
"""

import json
import pandas as pd
from pathlib import Path
import re

# Las Vegas 邮政编码范围 (Nevada)
LAS_VEGAS_ZIP_CODES = set(str(zip_code) for zip_code in range(89101, 89200))

def load_vaccine_distribution_data():
    """加载疫苗分发数据"""
    data_file = Path("docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json")

    if not data_file.exists():
        print(f"Error: {data_file} not found!")
        return None

    print(f"Loading data from {data_file}...")
    with open(data_file, 'r') as f:
        data = json.load(f)

    # 转换为 DataFrame
    df = pd.DataFrame(data['data'], columns=data['columns'])
    print(f"Total records loaded: {len(df)}")

    return df

def load_google_analytics_data():
    """加载 Google Analytics 数据 (Las Vegas 搜索记录)"""
    ga_dir = Path("src/data/GoogleAnalytics/")
    las_vegas_searches = []

    for csv_file in ga_dir.glob("CountryByBatchcode*.csv"):
        try:
            df = pd.read_csv(csv_file)
            # 筛选 Las Vegas 记录
            lv_records = df[df['City'].str.contains('Las Vegas', case=False, na=False)]
            if len(lv_records) > 0:
                lv_records['Source_File'] = csv_file.name
                las_vegas_searches.append(lv_records)
        except Exception as e:
            print(f"Warning: Could not process {csv_file}: {e}")

    if las_vegas_searches:
        return pd.concat(las_vegas_searches, ignore_index=True)
    return None

def analyze_las_vegas_distribution(df):
    """分析 Las Vegas 地区的疫苗分发情况"""
    print("\n" + "="*80)
    print("Las Vegas 地区疫苗分发批次分析")
    print("="*80)

    # 清理邮政编码列
    df['ZIP Code'] = df['ZIP Code'].astype(str).str.strip()

    # 提取 Las Vegas 地区数据
    # Las Vegas 邮政编码: 89101-89199
    las_vegas_data = df[df['ZIP Code'].apply(lambda x: any(x.startswith(lv_zip[:5]) for lv_zip in LAS_VEGAS_ZIP_CODES))]

    print(f"\n找到 {len(las_vegas_data)} 条 Las Vegas 地区的疫苗分发记录")

    if len(las_vegas_data) == 0:
        # 尝试其他方式查找
        print("\n正在尝试其他方式查找 Las Vegas 数据...")
        # 可能邮政编码格式不同,尝试搜索包含 89 开头的
        las_vegas_data = df[df['ZIP Code'].str.match(r'^89\d{3}', na=False)]
        print(f"找到 {len(las_vegas_data)} 条以 89 开头的记录")

    if len(las_vegas_data) == 0:
        print("\n警告: 未找到 Las Vegas 地区的疫苗分发数据")
        print("可用邮政编码示例:")
        print(df['ZIP Code'].head(20).tolist())
        return None

    # 批次统计
    print("\n" + "-"*80)
    print("1. 批次分布统计")
    print("-"*80)
    batch_stats = las_vegas_data.groupby('Lot Number').agg({
        'Doses Shipped': 'sum',
        'Statistical Number of Adverse Reaction Reports': 'sum',
        'Statistical Number of Adverse Reaction Reports (per 100,000)': 'mean',
        'Provider': 'count'
    }).round(2)
    batch_stats.columns = ['总剂量', '不良反应总数', '平均不良反应率(每10万剂)', '分发机构数']
    batch_stats = batch_stats.sort_values('总剂量', ascending=False)

    print(f"\nLas Vegas 地区共有 {len(batch_stats)} 个不同的批次")
    print(f"\n前 20 个批次 (按分发剂量排序):")
    print(batch_stats.head(20))

    # 高风险批次分析 (不良反应率高于平均值)
    print("\n" + "-"*80)
    print("2. 高风险批次分析 (不良反应率 > 100 每10万剂)")
    print("-"*80)
    high_risk = batch_stats[batch_stats['平均不良反应率(每10万剂)'] > 100].sort_values('平均不良反应率(每10万剂)', ascending=False)

    if len(high_risk) > 0:
        print(f"\n发现 {len(high_risk)} 个高风险批次:")
        print(high_risk)
    else:
        print("\n未发现不良反应率超过 100/10万 的批次")

    # 提供商统计
    print("\n" + "-"*80)
    print("3. 疫苗提供商统计")
    print("-"*80)
    provider_stats = las_vegas_data.groupby('Provider').agg({
        'Doses Shipped': 'sum',
        'Lot Number': 'nunique',
        'Statistical Number of Adverse Reaction Reports': 'sum'
    }).round(2)
    provider_stats.columns = ['总剂量', '批次数', '不良反应总数']
    provider_stats = provider_stats.sort_values('总剂量', ascending=False)

    print(f"\nLas Vegas 地区共有 {len(provider_stats)} 个疫苗提供商")
    print(f"\n前 10 个提供商 (按分发剂量排序):")
    print(provider_stats.head(10))

    # 邮政编码分布
    print("\n" + "-"*80)
    print("4. Las Vegas 邮政编码分布")
    print("-"*80)
    zip_stats = las_vegas_data.groupby('ZIP Code').agg({
        'Doses Shipped': 'sum',
        'Lot Number': 'nunique',
        'Provider': 'nunique'
    }).round(2)
    zip_stats.columns = ['总剂量', '批次数', '提供商数']
    zip_stats = zip_stats.sort_values('总剂量', ascending=False)

    print(f"\nLas Vegas 地区涉及 {len(zip_stats)} 个邮政编码:")
    print(zip_stats)

    return las_vegas_data, batch_stats

def analyze_google_analytics_searches(ga_df):
    """分析 Google Analytics 中 Las Vegas 用户的批次搜索"""
    print("\n" + "="*80)
    print("Las Vegas 用户批次搜索分析 (Google Analytics)")
    print("="*80)

    if ga_df is None or len(ga_df) == 0:
        print("未找到 Las Vegas 的搜索记录")
        return

    print(f"\n找到 {len(ga_df)} 条 Las Vegas 用户的批次搜索记录")

    # 区分 Nevada Las Vegas 和 New Mexico Las Vegas
    nv_lv = ga_df[ga_df['Region'] == 'Nevada']
    nm_lv = ga_df[ga_df['Region'] == 'New Mexico']

    print(f"\nNevada Las Vegas: {len(nv_lv)} 条记录")
    print(f"New Mexico Las Vegas: {len(nm_lv)} 条记录")

    # 统计最常搜索的批次 (Nevada Las Vegas)
    print("\n" + "-"*80)
    print("Nevada Las Vegas 最常搜索的批次:")
    print("-"*80)

    batch_searches = nv_lv.groupby('Clicked Batchcode').agg({
        'Event count': 'sum'
    }).sort_values('Event count', ascending=False)

    print(f"\n前 30 个最常搜索的批次:")
    print(batch_searches.head(30))

    # 统计总搜索量
    total_searches = nv_lv['Event count'].sum()
    print(f"\nNevada Las Vegas 总搜索次数: {total_searches}")

    # 未设置批次代码的搜索
    not_set = nv_lv[nv_lv['Clicked Batchcode'] == '(not set)']['Event count'].sum()
    print(f"未设置批次代码的搜索: {not_set} ({not_set/total_searches*100:.1f}%)")

    return nv_lv

def main():
    print("开始分析 Las Vegas 地区的疫苗批次分发问题...")

    # 1. 加载并分析疫苗分发数据
    df = load_vaccine_distribution_data()

    if df is not None:
        las_vegas_data, batch_stats = analyze_las_vegas_distribution(df)

        # 保存分析结果
        if las_vegas_data is not None:
            output_file = "las_vegas_vaccine_analysis.csv"
            las_vegas_data.to_csv(output_file, index=False)
            print(f"\n详细数据已保存到: {output_file}")

            batch_output = "las_vegas_batch_stats.csv"
            batch_stats.to_csv(batch_output)
            print(f"批次统计已保存到: {batch_output}")

    # 2. 加载并分析 Google Analytics 数据
    ga_df = load_google_analytics_data()
    if ga_df is not None:
        nv_lv_searches = analyze_google_analytics_searches(ga_df)

        if nv_lv_searches is not None:
            ga_output = "las_vegas_batch_searches.csv"
            nv_lv_searches.to_csv(ga_output, index=False)
            print(f"\n搜索记录已保存到: {ga_output}")

    print("\n" + "="*80)
    print("分析完成!")
    print("="*80)

if __name__ == "__main__":
    main()
