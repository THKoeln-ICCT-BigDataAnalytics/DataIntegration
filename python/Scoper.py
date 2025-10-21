import sys
# a) SchemasToGraph
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import itertools
import os
import time
import ast
# b.1) SignatureEncoding
from sentence_transformers import SentenceTransformer, util
# b.2) LinkabilityAssessor
from sklearn.metrics import mean_squared_error
import sklearn
import sklearn.decomposition
# c) LinkabilityCorrelator
# d) SemanticMatcher
from itertools import product

#disable DNN message regarding floating numbers
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'


# ====================================================a) SchemasToGraph====================================================
class tabular_file:
  def __init__(self, id, name, source_name, df):
    self.id = id
    self.name = name
    self.source_name = source_name
    self.df = df

def build_schema_graph(directory_path, schema_folders=None, extract_metadata=True, metadata_headers=False):
    column_names = [
        "id", "type", "parent_id", "schema", "name", "parent_name",
        "datatype", "constraints", "instances", "description", "text_sequence", "instance_sequence", "dataframe"
    ]
    df_graph = pd.DataFrame(columns=column_names)
    files = []
    id_iter_graph = itertools.count()
    file_encoding = 'utf8'

    if schema_folders is None:
        print("Schema folders not provided, reading all folders in the directory path.")
        schema_folders = os.listdir(directory_path)
        print(f"Found schema folders: {schema_folders}")
    else:
        schema_folders = ast.literal_eval(schema_folders) if isinstance(schema_folders, str) else schema_folders
        print(f"Extracting provided schema folders: {schema_folders}")
    
    for source_name in schema_folders:
        source_id = "entity_" + str(next(id_iter_graph))
        df_graph.loc[len(df_graph)] = {
            "id": source_id, "type": "schema", "schema": source_name, "name": source_name
        }
        
        source_path = os.path.join(directory_path, source_name)
        if not os.path.exists(source_path):
            continue

        for csv_file in os.listdir(source_path):
            if not csv_file.lower().endswith('.csv'):
                continue

            table_id = "entity_" + str(next(id_iter_graph))
            table_name = os.path.splitext(csv_file)[0].replace('.', '_')
            csv_path = os.path.join(source_path, csv_file)
            
            with open(csv_path, encoding=file_encoding, errors='backslashreplace') as f:
                file_df = pd.read_csv(f, nrows=1000, on_bad_lines='skip')

            df_graph.loc[len(df_graph)] = {
                "id": table_id,
                "type": "table",
                "parent_id": source_id,
                "schema": source_name,
                "name": table_name,
                "instances": ", ".join(file_df.columns),
                "instance_sequence": table_name + ": {" + str(", ".join(file_df.columns)) + "}",
                "text_sequence": f"{table_name} [{', '.join(file_df.columns)}]",
                "dataframe": str(len(files)) if extract_metadata else np.NaN
            }

            # First two rows contain metadata
            if metadata_headers:
                datatype_row = file_df.iloc[0]
                constraint_row = file_df.iloc[1]
                file_df = file_df.iloc[2:].reset_index(drop=True)
            else:
                datatype_row = file_df.dtypes #basic python dtype assignments
                constraint_row = dict(zip(file_df.columns, ["NaN" for i in range(len(file_df.columns))])) #sting NaN for unknown
                sampled_rows = None


            # Store in tabular_file object
            if extract_metadata:
                files.append(tabular_file(table_id, table_name, source_name, file_df))
                if not file_df.empty:
                    if (len(file_df) > 3) and (metadata_headers == False): # if some schemas do contain metadata headers, skip those
                        file_df = file_df.iloc[3:].reset_index(drop=True)
                    
                    # Count NaNs per row
                    nan_counts = file_df.isna().sum(axis=1)
                    # Sort rows by fewest NaNs
                    sorted_indices = nan_counts.sort_values().index
                    max_samples = min(5, len(file_df))
                    # Sample rows with fewest NaNs
                    sampled_rows = file_df.loc[sorted_indices[:max_samples]]
                    

            for column in file_df.columns:
                if sampled_rows is not None:
                    sampled_values = [str(row[column])for _, row in sampled_rows.iterrows()]
                    attribute_instances = ", ".join(map(str, sampled_values)).replace('\n', ' ')
                    column_datatype = datatype_row[column]
                    if column_datatype == "object":
                        column_datatype = "varchar2"                        
                    column_constraints = constraint_row[column]
                else:
                    attribute_instances = ""
                    column_datatype = np.nan
                    column_constraints = np.nan

                df_graph.loc[len(df_graph)] = {
                    "id":              "entity_" + str(next(id_iter_graph)),
                    "type":            "attribute",
                    "parent_id":       table_id,
                    "schema":          source_name,
                    "name":            column,
                    "parent_name":     table_name,
                    "datatype":        column_datatype,
                    "constraints":     column_constraints,
                    "instances":       attribute_instances,
                    "text_sequence":   str(column) + " " + str(table_name) + " " + str(column_datatype),
                    "instance_sequence": f"{column}: {{{attribute_instances}}}"
                }
        print(f"Schema Import: {source_name} completed.")

    return df_graph, files

# ==============================================b.1) SignatureEncoding====================================================


class Entity: #could be table or column
    def __init__(
        self, id, name, type, schema, parent_id, datatype=None, constraints=None, text_sequence=None
    ):
        self.id = id
        self.name = name
        self.type = type
        self.schema = schema
        self.parent_id = parent_id
        self.datatype = datatype
        self.constraints = constraints
        self.text_sequence = text_sequence
        
    def __repr__(self):
        return (f"Entity({self.id}, {self.datatype}, {self.schema}, {self.parent_id}")
    def get_text_sequence(self):
        return self.text_sequence
    def get_instance_sequence(self):
        return self.instance_sequence

def get_entity_signatures(entities, variant):
    entity_signatures = []
    for entity in entities:
        value = getattr(entity, variant)
        if isinstance(value, np.ndarray):
            entity_signatures.append(value)
        elif isinstance(value, str):
            entity_signatures.append(value)
        else:
            # Assuming tensor-like object that needs conversion to numpy
            try:
                entity_signatures.append(value.numpy())
            except AttributeError:
                entity_signatures.append(value)  # In case it's already a number or not convertible
    return np.array(entity_signatures)

def encode_signatures_from_df(df_graph, model_name='sentence-transformers/all-mpnet-base-v2', serialization="text_sequence", instance_serialization="instance_sequence"):
    entities = []
    model = SentenceTransformer(model_name)

    df_graph = df_graph[df_graph.type != "schema"].reset_index(drop=True)
        
    st = time.time()
    text_sequence = model.encode(df_graph[serialization].values)

    if instance_serialization:
        instance_sequence = model.encode(df_graph[instance_serialization].values)
        text_sequence = np.concatenate((text_sequence, instance_sequence), axis=1)
    et = time.time()
    
    print("Elapsed time for encoding signatures:" + str(et - st))

    for index, row in df_graph.reset_index(drop=True).iterrows():
        entity = Entity(
            id=row["id"],
            name= row["name"],
            type=row["type"],
            datatype=row["datatype"],
            schema=row["schema"],
            parent_id=row["parent_id"],
            text_sequence=text_sequence[index]
            )
        entities.append(entity)

    return entities;



# ==============================================b.2) LinkabilityAssessor====================================================

# Helper Functions
def entity_collection_by_source(ce, schema_name):
    #returns all entities for matching source
    return [entity for entity in ce if entity.schema == schema_name]

def entity_collection_by_sources(ce, schema_names):
    #returns all entities for matching sources
    return [entity for entity in ce if entity.schema in schema_names]


# PCA
def method_pca_variance(X, v):
    mean = np.mean(X, axis=0)
    X_centered = X - mean
    _, singular_values, all_pca = np.linalg.svd(X_centered, full_matrices=False)
    singular_values_squared = singular_values ** 2
    explained_variance = singular_values_squared / np.sum(singular_values_squared)
    cumulative_explained_variance = np.cumsum(explained_variance)
    n_components = np.searchsorted(cumulative_explained_variance, v) + 1
    pca = all_pca[:n_components, :] 
    X_encoded = X_centered @ pca.T
    X_decoded = X_encoded @ pca 
    X_decoded_centered = X_decoded + mean
    local_mse = pd.Series(map(mean_squared_error, X, X_decoded_centered))
    return local_mse, mean, pca


def pca_encode_decode(X, mean, pca):
    X_centered = X - mean
    X_encoded = X_centered @ pca.T
    X_decoded = X_encoded @ pca
    X_decoded_centered = X_decoded + mean    
    return pd.Series(map(mean_squared_error, X, X_decoded_centered))

def get_pca_components_given_variance(X, target_variance=0.9):
    if not (0 < target_variance < 1):
        raise ValueError("Target variance must be between 0 and 1")

    # Initialize PCA with enough components to calculate the full variance
    pca = sklearn.decomposition.PCA().fit(X)

    # Calculate the cumulative sum of explained variance ratios
    cumulative_variance = np.cumsum(pca.explained_variance_ratio_)

    # Find the number of components for the desired variance
    n_components = np.where(cumulative_variance >= target_variance)[0][0] + 1
    return n_components

def set_labels(entity_id, linkable_set):
    if entity_id in linkable_set:
        return True
    else:
        return False

# Collaborative Scoping
def collaborative_scoping(signatures, df, model_degree_variance, threshold, agreement=2, print_params=False, variant="text_sequence"):

    E_source_names = df.schema.unique()
    signatures_filter_df = entity_collection_by_sources(signatures, E_source_names)

    if isinstance(model_degree_variance, list):
        E_number_components = model_degree_variance
        if print_params:
            print(E_source_names)
            print("Custom Generalizability: " + str(E_number_components))
    else:
        E_number_components = [get_pca_components_given_variance(get_entity_signatures(entity_collection_by_source(signatures_filter_df, source_name), variant), model_degree_variance/100) for source_name in E_source_names]
        if print_params:
            print(E_source_names)
            print("Shared Generalizability: ("+ str(model_degree_variance) + "): " + str(E_number_components))

    E_models = [method_pca_variance(get_entity_signatures(entity_collection_by_source(signatures_filter_df, source_name), variant), model_degree_variance/100) for i, source_name in enumerate(E_source_names)]
    
    E_local_thresholds = [model[0].describe()[threshold] for model in E_models]

    local_signatures = get_entity_signatures(signatures_filter_df, variant)
    for i, source_name in enumerate(E_source_names):
        df[source_name] = pca_encode_decode(local_signatures, E_models[i][1], E_models[i][2])
        
    E_local_primes = [list(df[(df[source_name] < E_local_thresholds[i])].id.values) for i, source_name in enumerate(E_source_names)]

    E_prime = []
    for i, source_name in enumerate(E_source_names):
        E_prime = E_local_primes[i] + E_prime
        df[source_name+"_agree"] = 0 #disagree
        df.loc[df.id.isin(E_local_primes[i]), source_name+"_agree"] = 1 #agree

    #count agreements and filter
    df['overall_agreement'] = df[[source_name+"_agree" for source_name in E_source_names]].sum(axis=1)
    E_prime_agreed = list(df[df.overall_agreement >= agreement].id)

    # Confusion Matrix Analysis
    df["predict_linkability"] = df.apply(lambda x: set_labels(x.id, E_prime_agreed), axis = 1)
    #   df["confusion"] = df.apply(lambda x: set_confusion(x.label_linkability, x.predict_linkability), axis = 1)
    df["v"] = int(model_degree_variance)

    return E_prime_agreed, df


def collaborative_scoping_track(signatures, df_graph, variant="text_sequence"):
    p_list = np.arange(1,100,1)
    p_list =  [float("%.2f" % elem) for elem in p_list]
    v_list = list(reversed(p_list))
    df_graph = df_graph[df_graph.type != "schema"].reset_index(drop=True)
    results = []
    for v in v_list:
        df_performance = collaborative_scoping(signatures, df_graph, v, "max", print_params=False, variant=variant)[1].copy()
        results.append(df_performance)
        if(int(v)%10 == 0):
            v_dec = round(v*0.01, 2)
            print("Computation completed for v = " + str(round(v_dec+0.09,2)) + ".." + str(v_dec))
    return pd.concat(results, ignore_index=True, sort=False)



# ==============================================c). LinkabilityCorrelator====================================================


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

            # all_true correlation: alle schema elemente unabhängig vom Ursprung, wo aber mindestens src oder tgt "true" vorhersagen
            df_collaborative_scoping_v_true  = df_collaborative_scoping_v[(df_collaborative_scoping_v[src]==True) | (df_collaborative_scoping_v[tgt]==True)]
            corr_all_true_pred = df_collaborative_scoping_v_true[schemas_agree].corr().loc[src, tgt]
            entry["all_true"] = corr_all_true_pred

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
    # categories = ["all", "all_true", "filtered", "filtered_true"]
    categories = ["all", "filtered"]
   
    # Für jede Kategorie ein eigenes Diagramm
    for cat in categories:
        plt.figure(figsize=(9, 9))
        plt.rcParams.update({'font.size': 16})
        # Spalte in numerisch umwandeln (damit Strings oder "-" ignoriert werden)
        df_correlation[cat] = pd.to_numeric(df_correlation[cat], errors="coerce")

        df_correlation.v = df_correlation.v * 0.01

        # Jede Kombination von source/target bekommt eine eigene Linie
        for (src, tgt), group in df_correlation.groupby(["source", "target"]):
            sub = group.dropna(subset=[cat])
            sub = sub.sort_values("v", ascending=True)  # normale Reihenfolge

            linestyle = "--" if "FORMULA" in str(src) or "FORMULA" in str(tgt) else "-"

            plt.plot(sub["v"], sub[cat], label=f"{src}-{tgt}", linestyle = linestyle, linewidth=3)

        #plt.title(f"Korrelation ({cat})")
        plt.xlabel("v")
        plt.ylabel("$r$ (pearson)")
        plt.ylim(-1, 1)
        plt.legend()
        plt.grid(True)
        plt.gca().invert_xaxis()  # Dreht die X-Achse: 99 links, 1 rechts
        # plt.show()
        plt.savefig(directory_path + "/" + cat+".png")
        print("Exported file: " + directory_path+"/"+cat+".png")


# ==============================================d) SemanticMatcher ====================================================


# Helper Functions
def get_entity_by_entity_id(entities, entity_id):
  for entity in entities:
    if entity.id == entity_id:
      return entity
    
# Cartesian size between schemas 
# Limited to (a, b) linkages based on schemas (SCHEMA1>SCHEMA2>...) --> no (b, a) linkages
def get_cartesian_linkages_similarity(df, entities, variant="text_sequence"):
    node_type_attribute = "attribute"
    if "column" in df.type.unique():
        node_type_attribute = "column"

    schema_key_ignore = [] 
    cartesian_linkages_similarity = []
    for current_schema_name in list(df.schema.unique()):
        schema_key_ignore.append(current_schema_name)
        current_schema = df[df.schema == current_schema_name].reset_index(drop=True).copy()
        other_schemas = df[~df.schema.isin(schema_key_ignore)].reset_index(drop=True).copy()
        schema_linkages_tables = list(product(current_schema[current_schema.type == "table"].id, other_schemas[other_schemas.type == "table"].id))
        schema_linkages_attributes = list(product(current_schema[current_schema.type == node_type_attribute].id, other_schemas[other_schemas.type == node_type_attribute].id))

        for linkage in schema_linkages_tables + schema_linkages_attributes:
            signature_a = getattr(get_entity_by_entity_id(entities, linkage[0]), variant)
            signature_b = getattr(get_entity_by_entity_id(entities, linkage[1]), variant)
            cartesian_linkages_similarity.append((linkage[0], linkage[1], float(util.cos_sim(signature_a, signature_b))))

    return pd.DataFrame(data=cartesian_linkages_similarity, columns=["entity_a_id",	"entity_b_id", "cosine_similarity"])

# ============================================== MAIN ====================================================

if __name__ == "__main__":
    directory_path = str(sys.argv[1]) #C:\Users\leona\Desktop\schemas 
    print(len(sys.argv))
    # if len(sys.argv) > 1:
    #     schema_folders = str(sys.argv[2]) #"['imdb', 'sakila', 'movielens']"
    # else:
    schema_folders = None
    
    process = ["a) SchemasToGraph", "b.1) SignatureEncoding", "b.2) LinkabilityAssessor", "c) LinkabilityCorrelator", "d) SemanticMatcher"]
    process_line ="========================================================================================================="

    print(process[0] + "\n" + process_line)
    df_graph, files = build_schema_graph(directory_path = directory_path, schema_folders=schema_folders) 
    df_graph.to_csv(directory_path+"/schema_graph.csv", index=False)
    print("Schema Graph Metadata:")
    print("# Schemas: "+ str(len(df_graph[df_graph.type=="schema"])))
    print("# Tables: "+ str(len(df_graph[df_graph.type=="table"])))
    print("# Attributes: "+ str(len(df_graph[df_graph.type=="attribute"])))
    print("Path: " + directory_path + "/schema_graph.csv")
    print("Successfully completion." + "\n" + process_line)

    print(process[1] + "\n" + process_line)
    # df_graph = pd.read_csv(directory_path+"/schema_graph.csv")
    df_graph['text_sequence'] = df_graph['text_sequence'].astype(str)
    df_graph['instance_sequence'] = df_graph['instance_sequence'].astype(str)
    print("Default: Including entity serialization (e.g., " + df_graph.loc[2].text_sequence +")")
    instance_serialization = input("Optional: Include instance serialization (e.g., " + df_graph.loc[2].instance_sequence +")? (y/n): ")
    instance_sequence = "instance_sequence" if instance_serialization.lower() == 'y' else None
    entities = encode_signatures_from_df(df_graph, serialization="text_sequence", instance_serialization=instance_sequence)
    print("Successfully completion." + "\n" + process_line)

    print(process[2] + "\n" + process_line)
    df_graph_collaborative_scoping = collaborative_scoping_track(entities, df_graph)
    df_graph_collaborative_scoping.to_csv(directory_path+"/collaborative_scoping.csv", index=False)
    print("Exported file: " + directory_path+"/collaborative_scoping.csv")
    print("Process successfully completed." + "\n" + process_line)

    print(process[3] + "\n" + process_line)
    df_correlation = compute_correlation(df_graph_collaborative_scoping)
    df_correlation.sort_values(by=["v", "source", "target"], inplace=True)
    df_correlation.to_csv(directory_path+"/correlation.csv", index=False)
    print("Exported file: " + directory_path+"/correlation.csv")
    plot_correlation(df_correlation, directory_path)
    print("Process successfully completed." + "\n" + process_line)

    print(process[4] + "\n" + process_line)
    method_string = input("Specify matching method (SIM, CLUSTER, or LSH): ")
    if method_string == "SIM":
        df_graph_linkages = get_cartesian_linkages_similarity(df_graph, entities)
    elif method_string in ("CLUSTER", "LSH"):
        cardinality = input("Specify cardinality (as integer): ")
        # tbd. extend cluster and lsh method
        df_graph_linkages = get_cartesian_linkages_similarity(df_graph, entities)
    
    df_graph_linkages.to_csv(directory_path+"/linkages.csv", index=False)
    print("Exported file: " + directory_path+"/linkages.csv")
    print("Process successfully completed." + "\n" + process_line)