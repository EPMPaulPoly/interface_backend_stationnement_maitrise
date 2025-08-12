import os
import classes.parking_inventory as PI
import classes.parking_inventory_inputs as PII
import classes.parking_regs as PR
import classes.parking_reg_sets as PRS
import classes.tax_dataset as TD
import config.config_db as cf
import pandas as pd
import numpy as np
import sqlalchemy
import debugpy
import time
import psycopg2
if __name__== "__main__":
    try:
        if os.getenv("DEBUGPY_CALC_ENABLE", "true").lower() == "true":
            time.sleep(10)
            debugpy.listen(("0.0.0.0", 5678))
            print("Waiting for debugger attach...")
            debugpy.wait_for_client()
            print("Debugger attached!")
            # Établir la connexion
            connection = psycopg2.connect(cf.pg_string)
            print("Connexion à la base de données réussie")
        con = sqlalchemy.create_engine(cf.pg_string)
        tax_dataset,lot_list = TD.get_all_lots_with_valid_data(engine=con)
        lot_list_list = lot_list[cf.db_column_lot_id].unique().tolist()
        inventory_data = PI.get_lot_data_by_estimation(lot_list_list,2) # Obtiens les données calculées
        inventory_data_lot_list = inventory_data.parking_frame[cf.db_column_lot_id].unique().tolist()
        tax_data_set_final = tax_dataset.filter_by_id(inventory_data_lot_list)
        lot_list_final = lot_list.loc[lot_list[cf.db_column_lot_id].isin(inventory_data_lot_list)]
        reg_sets = PRS.get_all_reg_sets_from_database(engine=con)
        final_aggregate_data = pd.DataFrame()
        for reg_set in reg_sets:
            parking_inventory_indiv_reg_set =  PI.calculate_parking_specific_reg_set(reg_set,tax_data_set_final)
            aggregate_data = parking_inventory_indiv_reg_set.aggregate_statistics_by_land_use(lot_uses=lot_list_final,level=1)
            aggregate_data['id_er']=reg_set.ruleset_id
            if final_aggregate_data.empty:
                final_aggregate_data = aggregate_data
            else:
                final_aggregate_data=pd.concat([final_aggregate_data,aggregate_data])
        final_aggregate_data['n_places_min']= final_aggregate_data['n_places_min'].apply(np.ceil)
        final_aggregate_data.to_sql('variabilite',con=con.connect(),if_exists='replace')
        actual_inv_aggregate = inventory_data.aggregate_statistics_by_land_use(lot_uses=lot_list_final,level=1)
        actual_inv_aggregate.to_sql('inv_reg_aggreg_cubf_n1',con=con.connect(),if_exists='replace')
        print('[true]')
    except Exception as e:
        print('[false]')