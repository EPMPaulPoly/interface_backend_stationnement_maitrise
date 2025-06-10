import sys
import json
import pandas as pd
import classes.parking_inventory as PI
import os
import debugpy
import time
import psycopg2
import config.config_db as cf_db
import classes.parking_inventory_inputs as PII
import classes.parking_regs as PR

def main():
    if os.getenv("DEBUGPY_CALC_ENABLE", "true").lower() == "true":
        time.sleep(10)
        debugpy.listen(("0.0.0.0", 5678))
        print("Waiting for debugger attach...")
        debugpy.wait_for_client()
        print("Debugger attached!")
        # Établir la connexion
        connection = psycopg2.connect(cf_db.pg_string)
        print("Connexion à la base de données réussie")
    # Read the JSON data from stdin
    data = sys.stdin.read()

    # Deserialize the JSON data to a Python list of dictionaries
    array = json.loads(data)

    # Convert the list of dictionaries to a DataFrame
    generated_parking_inventory_inputs = PII.generate_values_based_on_available_data(array)
    #breakpoint()
    # Perform your calculations here
    inventaire = PI.calculate_inventory_from_manual_entry(generated_parking_inventory_inputs)
    inventaire_frame = inventaire.parking_frame.drop(columns=cf_db.db_column_parking_regs_id)
    inventaire_merge = inventaire_frame.merge(generated_parking_inventory_inputs,on=cf_db.db_column_lot_id,how='left')
    inventaire_pivot = inventaire_merge.pivot(columns=cf_db.db_column_parking_regs_id,index='valeur',values='n_places_min')
    #print(inventaire_pivot)
    reglements = generated_parking_inventory_inputs[cf_db.db_column_parking_regs_id].unique().tolist()
    inventaire_pivot.reset_index(inplace=True)
    json_out = '{'
    json_out += f'"labels": [{','.join(inventaire_pivot['valeur'].astype(str).to_list())}], "datasets":['
    dataset_list = []
    for reglement in reglements:
        rule: PR.ParkingRegulations = PR.from_postgis(reglement)
        unique_rule: PR.ParkingRegulations = rule.get_reg_by_id(reglement)
        description: str = unique_rule.reg_head.iloc[0].description
        dataset_out = '{'
        dataset_out += f'"label": "{description}", '
        dataset_out += f'"data": [{",".join(inventaire_pivot[reglement].astype(str).tolist())}]'
        dataset_out += '}'
        dataset_list.append(dataset_out)
    dataset_string = ','.join(dataset_list)
    json_out += dataset_string
    json_out +=']}'
    # convert dataframe to string for dumping it to console
    #string_output = inventaire.to_json()
    # Print the result to stdout
    print(json_out)

if __name__ == '__main__':
    main()