import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import itertools
import os
import ast

def compute_correlation(df_collaborative_scoping):
    # CSV laden

    schemas = df_collaborative_scoping.schema.unique()
    schemas_agree = [str(schema) + "_agree" for schema in schemas] 
    dict_agree_schemas = dict(zip(schemas_agree, schemas))
    v_values = sorted(df_collaborative_scoping["v"].dropna().unique(), reverse=True)

    results = []

    for v in v_values:
        df_collaborative_scoping_v = df_collaborative_scoping[df_collaborative_scoping["v"] == v]

        for src, tgt in itertools.combinations(schemas_agree, 2):
            entry = {
                "v": v,
                "source": dict_agree_schemas[src],
                "target": dict_agree_schemas[tgt]
            }

            # all: alle schema elemente unabhängig vom Ursprung
            corr_all = df_collaborative_scoping_v[schemas_agree].corr().loc[src, tgt]
            entry["all"] = corr_all

            # filtered correlation: nur schema elemente, welche nicht von src oder tgt herkommen
            df_collaborative_scoping_v_filtered = df_collaborative_scoping_v[(df_collaborative_scoping_v.schema != dict_agree_schemas[src]) & (df_collaborative_scoping_v.schema != dict_agree_schemas[tgt])]
            corr_filtered = df_collaborative_scoping_v_filtered[schemas_agree].corr().loc[src, tgt]
            entry["filtered"] = corr_filtered

            # filtered_true correlation: nur schema elemente, welche nicht von src oder tgt herkommen, wo aber mindestens src oder tgt "true" vorhersagen
            df_collaborative_scoping_v_filtered_true_pred  = df_collaborative_scoping_v_filtered[(df_collaborative_scoping_v_filtered[src]==True) | (df_collaborative_scoping_v_filtered[tgt]==True)]
            corr_filtered_true_pred = df_collaborative_scoping_v_filtered_true_pred[schemas_agree].corr().loc[src, tgt]
            entry["filtered_true"] = corr_filtered_true_pred

            results.append(entry)
    
    # Alle Korrelationen
    return pd.DataFrame(results)


def plot_correlation(df_correlation, directory_path):
    categories = ["all", "filtered", "filtered_true"]
   
    # Für jede Kategorie ein eigenes Diagramm
    for cat in categories:
        plt.figure(figsize=(12, 12))

        # Spalte in numerisch umwandeln (damit Strings oder "-" ignoriert werden)
        df_correlation[cat] = pd.to_numeric(df_correlation[cat], errors="coerce")

        # Jede Kombination von source/target bekommt eine eigene Linie
        for (src, tgt), group in df_correlation.groupby(["source", "target"]):
            sub = group.dropna(subset=[cat])
            sub = sub.sort_values("v", ascending=True)  # normale Reihenfolge

            linestyle = "--" if "FORMULA" in str(src) or "FORMULA" in str(tgt) else "-"

            plt.plot(sub["v"], sub[cat], label=f"{src}-{tgt}", linestyle = linestyle)

        plt.title(f"Korrelation ({cat})")
        plt.xlabel("v")
        plt.ylabel("$r$ (pearson)")
        plt.ylim(-1, 1)
        plt.legend()
        plt.grid(True)
        plt.gca().invert_xaxis()  # Dreht die X-Achse: 99 links, 1 rechts
        # plt.show()
        plt.savefig(directory_path + "/" + cat+".png")
        print("Exported file: " + directory_path+"/"+cat+".png")


if __name__ == "__main__":
    directory_path = str(sys.argv[1]) #C:\Users\leona\Documents\GitHub\DataIntegration\data\IMDbSakilaMovieLens
    

    # process = ["1. Schema Signature Encoding", "2. Linkability Assessment with Collaborative Scoping", "3. Correlation of Linkability Assessment", "4. Linkages"]
    process_line ="============================================================================================="

    print(process_line +  "\n" + "Read " + directory_path+"/collaborative_scoping.csv")
    df_collaborative_scoping = pd.read_csv(directory_path+"/collaborative_scoping.csv")
    print("Collaborative Scoping Metadata:")
    print("# Schemas: "+ str(len(df_collaborative_scoping.schema.unique())))
    print("Read successfully completed." + "\n" + process_line)
    
    print("3. Correlation of Linkability Assessment \n" + process_line)
    df_correlation = compute_correlation(df_collaborative_scoping)
    df_correlation.sort_values(by=["v", "source", "target"], inplace=True)
    df_correlation.to_csv(directory_path+"/correlation.csv", index=False)
    print("Exported file: " + directory_path+"/correlation.csv")
    plot_correlation(df_correlation, directory_path)
    print("Process successfully completed." + "\n" + process_line)




