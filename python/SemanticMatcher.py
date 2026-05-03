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
import faiss
from itertools import product
from sklearn.cluster import KMeans
from collections import defaultdict

#disable DNN message regarding floating numbers
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
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
    df_graph[serialization] = df_graph[serialization].astype(str) 
    text_sequence = model.encode(df_graph[serialization].values)

    if instance_serialization:
        df_graph[instance_serialization] = df_graph[instance_serialization].astype(str) 
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

# CLUSTER

def get_kMeans_linkages_similarity(df, entities, num_cluster=2, variant="text_sequence"):
    st = time.time()
    entity_dict = {e.id: e for e in entities}   
    node_type_attribute = "column" if "column" in df.type.unique() else "attribute"

    schema_key_ignore = [] 
    kMeans_schema_linkages = []
    
    for current_schema_name in list(df.schema.unique()):
        schema_key_ignore.append(current_schema_name)
        
        current_schema = df[df.schema == current_schema_name].reset_index(drop=True).copy()
        other_schemas = df[~df.schema.isin(schema_key_ignore)].reset_index(drop=True).copy()
        
        if other_schemas.empty:
            continue

        for other_schema_name in list(other_schemas.schema.unique()):
            target_schema = other_schemas[other_schemas.schema == other_schema_name]

            for entity_type in ["table", node_type_attribute]:
                
                ids_a = current_schema[current_schema.type == entity_type].id.tolist()
                ids_b = target_schema[target_schema.type == entity_type].id.tolist()
                
                if not ids_a or not ids_b:
                    continue
                
                all_ids = ids_a + ids_b
                all_signatures = [getattr(entity_dict[eid], variant) for eid in all_ids]
                
                if len(all_signatures) >= int(num_cluster):
                    kmeans = KMeans(n_clusters=int(num_cluster), random_state=42).fit(all_signatures)
                    labels = kmeans.labels_
                    
                    cluster_map = defaultdict(lambda: {'A': [], 'B': []})
                    
                    for i, (eid, label) in enumerate(zip(all_ids, labels)):
                        if i < len(ids_a):
                            cluster_map[label]['A'].append(eid)
                        else:
                            cluster_map[label]['B'].append(eid)
                            
                    # Calculate Cosine Similarity for the valid cluster combinations
                    for cluster in cluster_map.values():
                        if cluster['A'] and cluster['B']:
                            for eid_a, eid_b in product(cluster['A'], cluster['B']):
                                signature_a = getattr(entity_dict[eid_a], variant)
                                signature_b = getattr(entity_dict[eid_b], variant)
                                
                                # Compute similarity and append as a tuple
                                sim_score = float(util.cos_sim(signature_a, signature_b))
                                kMeans_schema_linkages.append((eid_a, eid_b, sim_score))

    et = time.time()
    print("Total elapsed time: " + str(round(et - st, 2)) + " seconds.")
    
    # Return as a pandas DataFrame identical to the Cartesian method
    return pd.DataFrame(data=kMeans_schema_linkages, columns=["entity_a_id", "entity_b_id", "cosine_similarity"])

#ANN

def get_FAISS_linkages_similarity(df, entities, k=1, variant="text_sequence"):
    st = time.time()
    entity_dict = {e.id: e for e in entities}
    node_type_attribute = "column" if "column" in df.type.unique() else "attribute"
    
    schema_key_ignore = []
    schema_FAISS_index_dict = defaultdict(dict)
    schema_elements_dict = defaultdict(dict) 
    FAISS_schema_linkages = []
    
    # 1. PHASE 1: Build one TABLE and one ATTRIBUTE index per schema
    for current_schema_name in list(df.schema.unique()):
        for entity_type in ["table", node_type_attribute]:
            schema_FAISS_index = faiss.IndexFlatL2(len(getattr(entities[0], variant)))
            current_schema_ids = df[(df.schema == current_schema_name) & (df.type == entity_type)].id.tolist()
            if current_schema_ids:
                current_schema_signatures = [getattr(entity_dict[eid], variant) for eid in current_schema_ids]
                schema_FAISS_index.add(np.asarray(current_schema_signatures))
            schema_FAISS_index_dict[current_schema_name][entity_type] = schema_FAISS_index
            schema_elements_dict[current_schema_name][entity_type] = current_schema_ids

    # 2. PHASE 2: Search
    for current_schema_name in list(df.schema.unique()):
        schema_key_ignore.append(current_schema_name)
        other_schemas_names = [other_schema_name for other_schema_name in list(df.schema.unique()) if other_schema_name not in schema_key_ignore]
        
        for other_schema_name in other_schemas_names:
            for entity_type in ["table", node_type_attribute]:
                
                other_schema_ids = schema_elements_dict[other_schema_name][entity_type]
                if not other_schema_ids:
                    continue 
                
                current_schema_rows = df[(df.schema == current_schema_name) & (df.type == entity_type)]
                actual_k = min(int(k), len(other_schema_ids))
                
                for i, row in current_schema_rows.iterrows():
                    q = getattr(entity_dict[row.id], variant)
                    
                    # Search the target index
                    _, I = schema_FAISS_index_dict[other_schema_name][entity_type].search(np.asarray([q]), actual_k)
                    
                    for item_pair in I[0]:
                        if item_pair != -1:
                            match_id = other_schema_ids[item_pair]
                            signature_a = q
                            signature_b = getattr(entity_dict[match_id], variant)
                            sim_score = float(util.cos_sim(signature_a, signature_b))
                            
                            FAISS_schema_linkages.append((row.id, match_id, sim_score))
                            
    et = time.time()
    print("Total elapsed time: " + str(round(et - st, 2)) + " seconds.")
    
    return pd.DataFrame(data=FAISS_schema_linkages, columns=["entity_a_id", "entity_b_id", "cosine_similarity"])
# ============================================== MAIN ====================================================

if __name__ == "__main__":
    directory_path = str(sys.argv[1]) #C:\Users\leona\Documents\GitHub\DataIntegration\data\OC3
    
    
    # process = ["a) SchemasToGraph", "b.1) SignatureEncoding", "b.2) LinkabilityAssessor", "c) LinkabilityCorrelator", "d) SemanticMatcher"]
    process_line ="============================================================================================="

    print(process_line +  "\n" + "Read " + directory_path+"/collaborative_scoping.csv")
    df_graph_collaborative_scoping = pd.read_csv(directory_path+"/collaborative_scoping.csv")

    v_filter = input("Input reduced schemas at variance value (99-1) or original schemas (0)?:")
    if int(v_filter) == 0:
        df_graph_matching = df_graph_collaborative_scoping[(df_graph_collaborative_scoping.v == 1)].reset_index(drop=True).copy()
    else:
        df_graph_matching = df_graph_collaborative_scoping[(df_graph_collaborative_scoping.v == int(v_filter)) &
                                                           (df_graph_collaborative_scoping.predict_linkability == True)].reset_index(drop=True).copy()
    

    print("Schema Graph Metadata:")
    print("# Schemas: "+ str(len(df_graph_matching[df_graph_matching.type=="schema"])))
    print("# Tables: "+ str(len(df_graph_matching[df_graph_matching.type=="table"])))
    print("# Attributes: "+ str(len(df_graph_matching[df_graph_matching.type=="attribute"])))
    print("Read successfully completed." + "\n" + process_line)
    
    print("b.1) SignatureEncoding" + "\n" + process_line)
    print("Default: Including schema_serialization (e.g., " + str(df_graph_matching.loc[2].text_sequence) +")")
    instance_serialization = input("Optional: Include instance_serialization? (y/n): ")
    # instance_serialization = input("Optional: Include instance_serialization (e.g., " + str(df_graph_matching.loc[2].instance_sequence) +")? (y/n): ")
    instance_sequence = "instance_sequence" if instance_serialization.lower() == 'y' else None
    entities = encode_signatures_from_df(df_graph_matching, serialization="text_sequence", instance_serialization=instance_sequence)
    print("Process successfully completed." + "\n" + process_line)

    print("d) SemanticMatcher" + "\n" + process_line)
    
    method_string = input("Specify matching method (SIM, CLUSTER, or ANN): ")

    if method_string == "SIM":
        df_graph_linkages = get_cartesian_linkages_similarity(df_graph_matching, entities)
    elif method_string in ("CLUSTER"):
        cardinality = input("Specify k-Means cardinality (as integer): ")
        df_graph_linkages = get_kMeans_linkages_similarity(df_graph_matching, entities, cardinality)
    elif method_string in ("ANN"):
        cardinality = input("Specify top-k cardinality (as integer): ")
        df_graph_linkages = get_FAISS_linkages_similarity(df_graph_matching, entities, cardinality)
    
    df_graph_linkages.to_csv(directory_path+"/linkages.csv", index=False)
    print("Exported file: " + directory_path+"/linkages.csv")
    print("Process successfully completed." + "\n" + process_line)