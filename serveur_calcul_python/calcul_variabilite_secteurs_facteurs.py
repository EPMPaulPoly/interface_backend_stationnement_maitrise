import os
import classes.parking_inventory as PI
import classes.parking_inventory_inputs as PII
import classes.parking_regs as PR
import classes.tax_dataset as TD
import config.config_db as cf
import sqlalchemy
if __name__== "__main__":
    PG_HOST = 'localhost'
    PG_DB = cf.pg_dbname
    PG_PORT = cf.pg_port
    PG_USERNAME = cf.pg_username
    PG_PWD = cf.pg_password
    pg_string = 'postgresql://' + PG_USERNAME + ':'  + PG_PWD + '@'  + PG_HOST + ':'  + PG_PORT + '/'  + PG_DB
    con = sqlalchemy.create_engine(pg_string)
    
    no_lot_pour_demo_log = 'PC-29190'
    tax_data_log = TD.tax_database_from_lot_id(no_lot_pour_demo_log)
    parking_reg_demo_log = PR.from_postgis(396)
    input_from_tax_data = PII.generate_calculation_input_from_tax_data(parking_reg_demo_log,tax_data_log)
    no_lot_galeries_art = ["1 150 585","1 477 688","6 431 400"]
    reg_galerie_art = 569
    tax_data_gal_art = TD.tax_database_from_lot_id(no_lot_galeries_art)
    reg_gal_art = PR.from_postgis(reg_galerie_art)
    input_from_tax_data_art = PII.generate_calculation_input_from_tax_data(reg_gal_art,tax_data_gal_art)
    print('test')