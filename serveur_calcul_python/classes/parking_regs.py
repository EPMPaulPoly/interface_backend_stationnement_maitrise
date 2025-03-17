import pandas as pd
import mimetypes
from utilitaires.database_interface import retrieve_table
from functools import singledispatchmethod,singledispatch
import numpy as np
from config import config_db
from sqlalchemy import create_engine,text
import logging
from typing import Optional, Union
class ParkingRegulations():
    def __init__(self,reg_head:pd.DataFrame,reg_def:pd.DataFrame,units_table:pd.DataFrame)->None:
        self.reg_head = reg_head
        self.reg_def = reg_def
        self.units_table = units_table
    
    def __repr__(self)->str:
        n_regs  = len(self.reg_head[config_db.db_column_parking_regs_id].unique())
        n_lines = len(self.reg_head[config_db.db_column_parking_regs_id].unique())

        return f"{n_regs} règlements sur {n_lines} lignes"

    def get_city_regs(self,city:str):
        data = self.reg_head.loc[self.reg_head["ville"]==city]
        reg_ids = data[config_db.db_column_parking_regs_id].unique()
        long_regs = self.reg_def[self.reg_def.isin(reg_ids)]
        object_out = ParkingRegulations(data,long_regs,self.units)
        return object_out
    
    def get_current_regs(self):
        data = self.reg_head.loc[self.reg_head["annee_fin"].isna()]
        reg_ids = data[config_db.db_column_parking_regs_id].unique()
        long_regs = self.reg_def[self.reg_def.isin(reg_ids)]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out
    
    def get_regs_for_year(self,year:int):
        data = self.reg_head.loc[((self.reg_head["annee_fin"]>=year)|((self.reg_head["annee_fin"].isna()))) & (self.reg_head["annee_debut"]<=year)]
        reg_ids = data[config_db.db_column_parking_regs_id].unique()
        long_regs = self.reg_def[self.reg_def[config_db.db_column_parking_regs_id].isin(reg_ids)]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out


    @singledispatchmethod
    def get_reg_by_id(self,id_to_get_):
        raise NotImplementedError("Cannot retrieve this data type")

    @get_reg_by_id.register
    def _(self,id_to_get_:int):
        data = self.reg_head.loc[self.reg_head[config_db.db_column_parking_regs_id]==id_to_get_]
        long_regs = self.reg_def.loc[self.reg_def[config_db.db_column_parking_regs_id]==id_to_get_]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out


    @get_reg_by_id.register
    def _(self,id_to_get_:np.ndarray):
        data = self.reg_head.loc[self.reg_head[config_db.db_column_parking_regs_id].isin(id_to_get_)]
        long_regs = self.reg_def.loc[self.reg_def[config_db.db_column_parking_regs_id].isin(id_to_get_)]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out
    
    @get_reg_by_id.register
    def _(self,id_to_get_:list):
        data = self.reg_head.loc[self.reg_head[config_db.db_column_parking_regs_id].isin(id_to_get_)]
        long_regs = self.reg_def.loc[self.reg_def[config_db.db_column_parking_regs_id].isin(id_to_get_)]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out
    
@singledispatch
def from_postgis(indice_):
    raise NotImplementedError("Cannot retrieve this data type")

@from_postgis.register
def _(indice_:int):
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        command = f"SELECT * FROM public.entete_reg_stationnement WHERE {config_db.db_column_parking_regs_id} = {indice_}"
        reg_head = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id)
        command = f"SELECT * FROM public.reg_stationnement_empile WHERE {config_db.db_column_parking_regs_id} = {indice_}" 
        reg_def = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id)
        command = f"SELECT * FROM public.multiplicateur_facteurs_colonnes"
        units_table = pd.read_sql(command,con)
    object_out = ParkingRegulations(reg_head,reg_def,units_table)
    return object_out

@from_postgis.register
def _(indice_:list):
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        command = f"SELECT * FROM public.entete_reg_stationnement WHERE {config_db.db_column_parking_regs_id} IN ({','.join(map(str, indice_))})"
        reg_head = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id)
        command = f"SELECT * FROM public.reg_stationnement_empile WHERE {config_db.db_column_parking_regs_id} IN ({','.join(map(str, indice_))})" 
        reg_def = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id)
        command = f"SELECT * FROM public.multiplicateur_facteurs_colonnes"
        units_table = pd.read_sql(command,con)
    object_out = ParkingRegulations(reg_head,reg_def,units_table)
    return object_out

def get_units_for_regs(regs_units_for:Union[list[int],int])->pd.DataFrame:
    query = ''
    if isinstance(regs_units_for,list):
        query=f'''
            SELECT DISTINCT
                rse.id_reg_stat,
                rse.unite,
                mfc.desc_unite
            FROM
                public.reg_stationnement_empile as rse
            JOIN
                public.multiplicateur_facteurs_colonnes as mfc on mfc.id_unite = rse.unite 
            WHERE 
                rse.id_reg_stat IN ({','.join(map(str,regs_units_for))})
            '''    
    else:
        query=f'''
            SELECT DISTINCT
                rse.id_reg_stat,
                rse.unite,
                mfc.desc_unite
            FROM
                public.reg_stationnement_empile as rse
            JOIN
                public.multiplicateur_facteurs_colonnes as mfc on mfc.id_unite = rse.unite 
            WHERE 
                rse.id_reg_stat = {regs_units_for}
            '''    
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        units = pd.read_sql_query(query,con)
    return units

if __name__ =="__main__":
    table = config_db.db_table_parking_reg_headers
    table_long_regs = config_db.db_table_parking_reg_stacked
    table_units = config_db.db_table_units
    id_column = config_db.db_column_parking_regs_id
    #data = retrieve_table(table,id_column)
    #long_regs = retrieve_table(table_long_regs,id_column)
    #units_table = retrieve_table(table_units,config_db.db_units_id)
    #instance_of_parking_regs = ParkingRegulations(data,long_regs,units_table)
    #print(instance_of_parking_regs)
    #reg_by_id = instance_of_parking_regs.get_reg_by_id(np.array([1,3,4]))
    #print(reg_by_id)
    test_postgis_retrieval = from_postgis([1,3,4])
    
    print(test_postgis_retrieval)

