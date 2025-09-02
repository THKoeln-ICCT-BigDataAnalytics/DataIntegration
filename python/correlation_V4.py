import pandas as pd
import itertools

# CSV laden
df = pd.read_csv("OC3FO_collaborative_scoping.csv")

agree_cols = ["OC_ORACLE_agree", "OC_MYSQL_agree", "OC_SAP_agree", "FORMULA_agree"]
v_values = sorted(df["v"].dropna().unique(), reverse=True)

results = []
results_filtered = []  # <-- zweite Ergebnisliste

# Mapping von "_agree"-Spalten zu den Schema-Namen
schema_mapping = {
    "OC_ORACLE_agree": "OC-ORACLE",
    "OC_MYSQL_agree": "OC-MYSQL",
    "OC_SAP_agree": "OC-SAP",
    "FORMULA_agree": "FORMULA"
}

for v in v_values:
    df_v = df[df["v"] == v]

    group_all = df_v
    group_all_true = df_v[df_v["predict_linkability"] == True]
    group_all_false = df_v[df_v["predict_linkability"] == False]

    for src, tgt in itertools.combinations(agree_cols, 2):
        entry = {
            "v": v,
            "source": schema_mapping[src],
            "target": schema_mapping[tgt]
        }

        # all
        if len(group_all) >= 2:
            corr_all = group_all[agree_cols].corr().loc[src, tgt]
            entry["all"] = corr_all
        else:
            entry["all"] = "-"

        # all_true
        if len(group_all_true) >= 2:
            corr_true = group_all_true[agree_cols].corr().loc[src, tgt]
            entry["all_true"] = corr_true
        else:
            entry["all_true"] = "-"

        # all_false
        if len(group_all_false) >= 2:
            corr_false = group_all_false[agree_cols].corr().loc[src, tgt]
            entry["all_false"] = corr_false
        else:
            entry["all_false"] = "-"

        results.append(entry)

        
        # gefilterte Korrelation
        
        filtered = df_v[(df_v[src] == 0) | (df_v[tgt] == 0)]
        filtered_entry = {
            "v": v,
            "source": schema_mapping[src],
            "target": schema_mapping[tgt]
        }

        if len(filtered) >= 2:
            corr_filtered = filtered[agree_cols].corr().loc[src, tgt]
            filtered_entry["filtered"] = corr_filtered
        else:
            filtered_entry["filtered"] = "-"

        results_filtered.append(filtered_entry)

# Normale Korrelationen
df_result = pd.DataFrame(results)
df_result.sort_values(by=["v", "source", "target"], inplace=True)
df_result.to_csv("Korrelation_OC3FO.csv", index=False)

# Gefilterte Korrelationen
df_result_filtered = pd.DataFrame(results_filtered)
df_result_filtered.sort_values(by=["v", "source", "target"], inplace=True)
df_result_filtered.to_csv("Korrelation_OC3FO_filtered.csv", index=0)

print("Normale Korrelationen:", df_result.head(10))
print("Gefilterte Korrelationen:", df_result_filtered.head(10))
