import numpy as np
import geopandas as gpd
import pandas as pd
from typing import Optional, Union
from datetime import datetime
from sqlalchemy import create_engine,text
from stationnement_vdq_hors_rue_reglementaire.config import config_db
from stationnement_vdq_hors_rue_reglementaire.classes import parking_reg_sets as PRS
from stationnement_vdq_hors_rue_reglementaire.classes import tax_dataset as TD
import matplotlib.pyplot as plt

class RegSetTerritory():
    '''
        # reg_set_territory 
         This is an object that represents the combination of a territory and a ruleset
         ## Attributes:
            Territory: GeoSeries representing the territory of a municipality, the end and start date of it's existence
            ruleset: a ParkingRegulationSet as defined in the classes document See that file for more details
         ## Methods:

    '''
    def __init__(self, territory: gpd.GeoSeries, parking_regulation_set:PRS.ParkingRegulationSet,period_start_year:int,period_end_year:int):
        self.territory_info = territory
        self.parking_regulation_set = parking_regulation_set
        self.start_year = period_start_year
        self.end_year = period_end_year
    
    def __repr__(self):
        return f"Territory: {self.territory_info[config_db.db_column_territory_name].values[0]} - {self.start_year:.0f}-{self.end_year:.0f} - Ruleset: {self.parking_regulation_set.description}"
    
def get_postgis_rst_by_terr_id(territory_id:Union[int,list[int]])->list[RegSetTerritory]:
    '''# get_postgis_rst_by_terr_id
    Function return a list of RegSetTerritory objects which represent the combination of a municipal territory, a time span and a regulation set that applies to the properties in the zone built in the time period. 
    ## Inputs
        - territory_id:int or list of ints that indicate the territory ids to query for data
    ## Outputs:
        - list of RegSetTerritory: RegSetTerritory(combination of a territory, validity dates based on either ruleset or validity of territory) which identifies geographic boundaries, and relevant parking rules for a given time span.
    '''
    # build queries for association table and territory table where the input territories are included
    if isinstance(territory_id,int):
        query_assoc = f'SELECT * FROM public.{config_db.db_table_match_regsets_territory} WHERE {config_db.db_column_territory_id} = {territory_id}'
        query_terr = f'SELECT * FROM public.{config_db.db_table_territory} WHERE {config_db.db_column_territory_id} = {territory_id}'
    else:
        query_assoc = f"SELECT * FROM public.{config_db.db_table_match_regsets_territory} WHERE {config_db.db_column_territory_id} in ({",".join(map(str,territory_id))})"
        query_terr = f"SELECT * FROM public.{config_db.db_table_territory} WHERE {config_db.db_column_territory_id} in ({",".join(map(str,territory_id))})"
    print(query_assoc)
    # build query for 
    query_hist = f"SELECT * FROM public.{config_db.db_table_history}"
    eng = create_engine(config_db.pg_string)
    territories = gpd.read_postgis(query_terr,con=eng,geom_col=config_db.db_geom_territory)
    
    with eng.connect() as con:
        history:pd.DataFrame = pd.read_sql(query_hist,con=con)
        associations = pd.read_sql(query_assoc,con=con)

        RST_list_to_return =[]
        for _,association in associations.iterrows():
            reg_set_to_get = association[config_db.db_column_reg_sets_id]
            relevant_territory_id = association[config_db.db_column_territory_id]
            relevant_territory = territories.loc[territories[config_db.db_column_territory_id]==relevant_territory_id]
            start_year_terr = history.loc[history[config_db.db_column_history_id] == relevant_territory[config_db.db_column_history_id].values[0],config_db.db_column_history_start_year].values[0]
            end_year_terr = history.loc[history[config_db.db_column_history_id] == relevant_territory[config_db.db_column_history_id].values[0],config_db.db_column_history_end_year].values[0]
            reg_set:PRS.ParkingRegulationSet = PRS.from_sql(int(reg_set_to_get),con=con)[0]
            start_year_regset = reg_set.start_date
            end_year_regset = reg_set.end_date
            if start_year_terr is None and start_year_regset is None:
                start_year_RST = None
            elif start_year_terr is None:
                start_year_RST = start_year_regset
            elif start_year_regset is None:
                start_year_RST = start_year_terr
            else:
                start_year_RST = max(start_year_terr,start_year_regset)
            
            if end_year_terr is None and end_year_regset is None:
                end_year_RST = None
            elif start_year_terr is None:
                end_year_RST = end_year_regset
            elif  start_year_regset is None :
                end_year_RST = end_year_terr
            else:
                end_year_RST = min(end_year_terr,end_year_regset)
            RST_to_append = RegSetTerritory(relevant_territory,reg_set,start_year_RST,end_year_RST)
            RST_list_to_return.append(RST_to_append)
    return RST_list_to_return  
