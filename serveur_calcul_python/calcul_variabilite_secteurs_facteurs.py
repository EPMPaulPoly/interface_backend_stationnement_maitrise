import os
import classes.parking_inventory as PI
import classes.parking_inventory_inputs as PII
import classes.parking_regs as PR
import classes.parking_reg_sets as PRS
import classes.tax_dataset as TD
import config.config_db as cf
import pandas as pd
import sqlalchemy
if __name__== "__main__":
    try:
        con = sqlalchemy.create_engine(cf.pg_string)
        tax_dataset,lot_list = TD.get_all_lots_with_valid_data(engine=con)
        reg_sets = PRS.get_all_reg_sets_from_database(engine=con)
        final_aggregate_data = pd.DataFrame()
        for reg_set in reg_sets:
            parking_inventory_indiv_reg_set =  PI.calculate_parking_specific_reg_set(reg_set,tax_dataset)
            aggregate_data = parking_inventory_indiv_reg_set.aggregate_statistics_by_land_use(lot_uses=lot_list,level=1)
            aggregate_data['id_er']=reg_set.ruleset_id
            if final_aggregate_data.empty:
                final_aggregate_data = aggregate_data
            else:
                final_aggregate_data=pd.concat([final_aggregate_data,aggregate_data])
        final_aggregate_data.to_sql('variabilite',con=con.connect(),if_exists='replace')
        print('true')
    except Exception as e:
        print('false')