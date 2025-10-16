
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import itertools
import os
import ast
#1. Schema Signature Encoding
from sentence_transformers import SentenceTransformer, util
import time
#2. Linkability Assessment with Collaborative Scoping
from sklearn.metrics import mean_squared_error
import sklearn
import sklearn.decomposition

# ==============================================1. Schema Signature Encoding====================================================

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

# ==============================================2. Linkability Assessment with Collaborative Scoping====================================================

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
        print("Computation completed for v = " + str(v))
    return pd.concat(results, ignore_index=True, sort=False)

# ============================================== MAIN ====================================================

if __name__ == "__main__":
    directory_path = str(sys.argv[1]) #C:\Users\leona\Documents\GitHub\DataIntegration\data\IMDbSakilaMovieLens
    
    # process = ["a) SchemasToGraph", "b.1) SignatureEncoding", "b.2) LinkabilityAssessor", "c) LinkabilityCorrelator", "d) SemanticMatcher"]
    process_line ="============================================================================================="

    print(process_line +  "\n" + "Read " + directory_path+"/schema_graph.csv")
    df_graph = pd.read_csv(directory_path+"/schema_graph.csv")
    print("Schema Graph Metadata:")
    print("# Schemas: "+ str(len(df_graph[df_graph.type=="schema"])))
    print("# Tables: "+ str(len(df_graph[df_graph.type=="table"])))
    print("# Attributes: "+ str(len(df_graph[df_graph.type=="attribute"])))
    print("Read successfully completed." + "\n" + process_line)
    
    print("b.1) SignatureEncoding" + "\n" + process_line)
    df_graph['text_sequence'] = df_graph['text_sequence'].astype(str)
    print("Default: Including entity serialization (e.g., " + df_graph.loc[2].text_sequence +")")
    
    if "instance_sequence" in df_graph:
        df_graph['instance_sequence'] = df_graph['instance_sequence'].astype(str)
        instance_serialization = input("Optional: Include instance serialization (e.g., " + df_graph.loc[2].instance_sequence +")? (y/n): ")
        instance_sequence = "instance_sequence" if instance_serialization.lower() == 'y' else None
    else:
        instance_sequence = None

    entities = encode_signatures_from_df(df_graph, serialization="text_sequence", instance_serialization=instance_sequence)
    print("Process successfully completed." + "\n" + process_line)

    print("b.2) LinkabilityAssessor" + "\n" + process_line)
    df_graph_collaborative_scoping = collaborative_scoping_track(entities, df_graph)
    df_graph_collaborative_scoping.to_csv(directory_path+"/collaborative_scoping.csv", index=False)
    print("Exported file: " + directory_path+"/collaborative_scoping.csv")
    print("Process successfully completed." + "\n" + process_line)