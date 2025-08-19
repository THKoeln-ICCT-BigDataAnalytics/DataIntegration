import pandas as pd
import matplotlib.pyplot as plt

# CSV laden
df_result = pd.read_csv(r"Korrelation_OC3FO.csv")

# v als Zahl konvertieren
df_result["v"] = pd.to_numeric(df_result["v"], errors="coerce")

# Kategorien
categories = ["all", "all_true", "all_false"]

# Für jede Kategorie ein eigenes Diagramm
for cat in categories:
    plt.figure(figsize=(8, 5))

    # Spalte in numerisch umwandeln (damit Strings oder "-" ignoriert werden)
    df_result[cat] = pd.to_numeric(df_result[cat], errors="coerce")

    # Jede Kombination von source/target bekommt eine eigene Linie
    for (src, tgt), group in df_result.groupby(["source", "target"]):
        sub = group.dropna(subset=[cat])
        sub = sub.sort_values("v", ascending=True)  # normale Reihenfolge
        plt.plot(sub["v"], sub[cat], label=f"{src}-{tgt}")

    plt.title(f"Korrelationen ({cat})")
    plt.xlabel("v")
    plt.ylabel("Korrelation")
    plt.ylim(-1, 1)
    plt.legend()
    plt.grid(True)
    plt.gca().invert_xaxis()  # Dreht die X-Achse: 99 links, 1 rechts
    plt.show()
