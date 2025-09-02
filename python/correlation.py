import pandas as pd
import numpy as np
import itertools

# CSV laden
df_collaborative_scoping = pd.read_csv("https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/collaborative_scoping.csv")

schemas = df_collaborative_scoping.schema.unique()
schemas_agree = [str(schema) + "_agree" for schema in schemas] 
dict_agree_schemas = dict(zip(schemas_agree, schemas))

# agree_cols = ["OC_ORACLE_agree", "OC_MYSQL_agree", "OC_SAP_agree", "FORMULA_agree"]
v_values = sorted(df_collaborative_scoping["v"].dropna().unique(), reverse=True)

results = []
results_filtered = []

# Mapping von "_agree"-Spalten zu den Schema-Namen
# schema_mapping = {
#     "OC_ORACLE_agree": "OC-ORACLE",
#     "OC_MYSQL_agree": "OC-MYSQL",
#     "OC_SAP_agree": "OC-SAP",
#     "FORMULA_agree": "FORMULA"
# }

for v in v_values:
    df_collaborative_scoping_v = df_collaborative_scoping[df_collaborative_scoping["v"] == v]

    
    if "predict_linkability" in df_collaborative_scoping_v.columns:
        df_collaborative_scoping_v_true = df_collaborative_scoping_v[df_collaborative_scoping_v["predict_linkability"] == True]
        df_collaborative_scoping_v_false = df_collaborative_scoping_v[df_collaborative_scoping_v["predict_linkability"] == False]


    for src, tgt in itertools.combinations(schemas_agree, 2):
        entry = {
            "v": v,
            "source": dict_agree_schemas[src],
            "target": dict_agree_schemas[tgt]
        }

        # all: alle schema elemente unabhängig vom Ursprung
        if len(df_collaborative_scoping) >= 2:
            corr_all = df_collaborative_scoping_v[schemas_agree].corr().loc[src, tgt]
            entry["all"] = corr_all
        else:
            entry["all"] = np.NaN

        # filtered correlation: nur schema elemente, welche nicht von src oder tgt herkommen
        df_collaborative_scoping_v_filtered = df_collaborative_scoping_v[(df_collaborative_scoping_v[src] == 0) & (df_collaborative_scoping_v[tgt] == 0)]

        if len(df_collaborative_scoping_v_filtered) >= 2:
            remaining_schemas = [c for c in schemas_agree if c not in [src, tgt]]
            corr_filtered = df_collaborative_scoping_v_filtered[remaining_schemas].corr().iloc[0, 1]
            entry["filtered"] = corr_filtered
        else:
            entry["filtered"] = np.NaN


        # all_true
        # if len(df_collaborative_scoping_v_true) >= 2:
        #     corr_true = df_collaborative_scoping_v_true[schemas].corr().loc[src, tgt]
        #     entry["all_true"] = corr_true
        # else:
        #     entry["all_true"] = np.NaN

        # # all_false
        # if len(df_collaborative_scoping_v_false) >= 2:
        #     corr_false = df_collaborative_scoping_v_false[schemas].corr().loc[src, tgt]
        #     entry["all_false"] = corr_false
        # else:
        #     entry["all_false"] = np.NaN

        results.append(entry)


# Alle Korrelationen
df_result = pd.DataFrame(results)
df_result.sort_values(by=["v", "source", "target"], inplace=True)
df_result.to_csv("linkability_correlation.csv", index=False)

print("Normale Korrelationen:", df_result.head(10))
