import classes.parking_reg_sets as PRS
import classes.parking_regs as PR
import os
import debugpy
import sys
import psycopg2
import config.config_db as cf_db
from psycopg2 import OperationalError
import time
import json
import pandas as pd
if __name__=="__main__":
    #print(sys.argv)
    try:
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
        array_entry = array[0]
        land_use_id = array_entry['cubf']
        prs_ids = array_entry['id_er']
        #breakpoint()
        reg_sets = PRS.from_sql(prs_ids)
        reg_set_list =[]
        reg_list = []
        unit_list = []
        for reg_set in reg_sets:
            reg_id = reg_set.get_unique_reg_ids_using_land_use([land_use_id])
            reg_out:PR.ParkingRegulations = reg_set.get_reg_by_id(reg_id)
            unit_out = reg_out.get_units()
            reg_set_list.append(reg_set.ruleset_id)
            reg_list.append(reg_out.get_reg_id())
            unit_list.append(unit_out)
        dict_out = {'id_er':reg_set_list,'id_reg_stat':reg_list,'unite':unit_list}
        df_out = pd.DataFrame(dict_out)
        json_out = df_out.to_json(orient='records',force_ascii=False)
        print(json_out)
        #breakpoint()
    except OperationalError as e:
        print(f"Erreur de connexion : {e}")
        #breakpoint()
    