import classes.parking_reg_sets as PRS
import os
import debugpy
import sys
import psycopg2
import config.config_db as cf_db
from psycopg2 import OperationalError
import time
if __name__=="__main__":
    #print(sys.argv)
    try:
        lot_a_analyser = sys.argv[1]
        if os.getenv("DEBUGPY_CALC_ENABLE", "true").lower() == "true":
            print(f'Lot A analyser: {lot_a_analyser}')
            time.sleep(10) 
            debugpy.listen(("0.0.0.0", 5678))
            print("Waiting for debugger attach...")
            debugpy.wait_for_client()
            print("Debugger attached!")
            # Établir la connexion
            connection = psycopg2.connect(cf_db.pg_string)
            print("Connexion à la base de données réussie")
        association = PRS.get_parking_reg_for_lot(lot_a_analyser)
        #print(inventaire_quartier)
        json_inventaire_quartier = association.to_json(orient='records',force_ascii=False)
        #breakpoint()
        print(json_inventaire_quartier)
    except OperationalError as e:
        print(f"Erreur de connexion : {e}")
        #breakpoint()
    