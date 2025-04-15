import classes.vehicle_accumulation_profile as VAP
import sys
import json
import psycopg2
from psycopg2 import OperationalError
import config.config_db as cf_db
import debugpy
import time
import os

if __name__=="__main__":
    #print(sys.argv)
    try:
        quartier_a_analyser = int(sys.argv[1])
        if os.getenv("DEBUGPY_CALC_ENABLE", "true").lower() == "true":
            print(f'Quartier à analyser: {quartier_a_analyser}')
            time.sleep(10) 
            debugpy.listen(("0.0.0.0", 5678))
            print("Waiting for debugger attach...")
            debugpy.wait_for_client()
            print("Debugger attached!")
            # Établir la connexion
            connection = psycopg2.connect(cf_db.pg_string)
            print("Connexion à la base de données réussie")
        vap:VAP.VehicleAccumulationProfile = VAP.calculate_VAP_from_database_data(quartier_a_analyser)
        #print(inventaire_quartier)
        json_vap = vap.to_json()
        #breakpoint()
        print(json_vap)
    except OperationalError as e:
        print(f"Erreur de connexion : {e}")
        #breakpoint()