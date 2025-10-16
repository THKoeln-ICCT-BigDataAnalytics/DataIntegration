
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
#2. Semantic Matching
from itertools import product

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

# ==============================================2. Semantic Matching ====================================================


# Helper Functions
def get_entity_by_entity_id(entities, entity_id):
  for entity in entities:
    if entity.entity_id == entity_id:
      return entity
    
# Cartesian size between schemas 
# Limited to (a, b) linkages based on schemas (SCHEMA1>SCHEMA2>...) --> no (b, a) linkages
def get_cartesian_linkages_similarity(df, signatures, variant="text_sequence"):
    schema_key_ignore = [] 
    cartesian_linkages_similarity = []
    for current_schema_name in list(df.schema.unique()):
        schema_key_ignore.append(current_schema_name)
        current_schema = df[df.schema == current_schema_name].reset_index(drop=True).copy()
        other_schemas = df[~df.schema.isin(schema_key_ignore)].reset_index(drop=True).copy()
        schema_linkages_tables = list(product(current_schema[current_schema.type == "table"].id, other_schemas[other_schemas.type == "table"].id))
        schema_linkages_attributes = list(product(current_schema[current_schema.type == "attribute"].id, other_schemas[other_schemas.type == "attribute"].id))

        for linkage in schema_linkages_tables + schema_linkages_attributes:
            signature_a = getattr(get_entity_by_entity_id(signatures, linkage[0]), variant)
            signature_b = getattr(get_entity_by_entity_id(signatures, linkage[1]), variant)
            cartesian_linkages_similarity.append((linkage[0], linkage[1], float(util.cos_sim(signature_a, signature_b))))

    #print(cartesian_linkages_similarity[0][2])
    return cartesian_linkages_similarity





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

    print("d) SemanticMatcher" + "\n" + process_line)
    



    df_graph_linkages.to_csv(directory_path+"/linkages.csv", index=False)
    print("Exported file: " + directory_path+"/linkages.csv")
    print("Process successfully completed." + "\n" + process_line)