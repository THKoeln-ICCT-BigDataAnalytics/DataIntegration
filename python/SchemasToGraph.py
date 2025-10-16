import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import itertools
import os
import ast


# ====================================================0. Schema Import====================================================
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
                    "text_sequence":   f"{column} {table_name}",
                    "instance_sequence": f"{column}: {{{attribute_instances}}}"
                }
        print(f"Schema Import: {source_name} completed.")

    return df_graph, files


if __name__ == "__main__":
    directory_path = str(sys.argv[1]) #C:\Users\leona\Desktop\schemas 
    print(len(sys.argv))
    
    schema_folders = None
    schema_folders = "['oc_mysql', 'oc_oracle', 'tpch_sf1']"
    
    # process = ["a) SchemasToGraph", "b.1) SignatureEncoding", "b.2) LinkabilityAssessor", "c) LinkabilityCorrelator", "d) SemanticMatcher"]
    process_line ="============================================================================================="

    print("a) SchemasToGraph" + "\n" + process_line)
    df_graph, files = build_schema_graph(directory_path = directory_path, schema_folders=schema_folders) 
    df_graph.to_csv(directory_path+"/schema_graph.csv", index=False)
    print("Schema Graph Metadata:")
    print("# Schemas: "+ str(len(df_graph[df_graph.type=="schema"])))
    print("# Tables: "+ str(len(df_graph[df_graph.type=="table"])))
    print("# Attributes: "+ str(len(df_graph[df_graph.type=="attribute"])))
    print("Exported file: " + directory_path+"/schema_graph.csv")
    print("Process successfully completed." + "\n" + process_line)