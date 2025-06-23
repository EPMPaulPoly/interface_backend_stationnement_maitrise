import pandas as pd
import mimetypes
from utilitaires.database_interface import retrieve_table
from functools import singledispatchmethod,singledispatch
import numpy as np
from config import config_db
from sqlalchemy import create_engine,text
import logging
from typing import Optional, Union,Self
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
    
    def get_reg_id(self):
        if self.check_only_one_regulation():
            return self.reg_head[config_db.db_column_parking_regs_id].unique().tolist()[0]

    def get_subset_def(self,subset_id:int)->pd.DataFrame:
        return self.reg_def.loc[self.reg_def[config_db.db_column_parking_subset_id]==subset_id]

    def get_subset_intra_operation_type(self,subset:int)->int:
        subset_def = self.get_subset_def(subset)
        if len(subset_def)>1:
            subset_def.sort_values(by=config_db.db_column_stacked_parking_id,ascending=True,inplace=True)
            other_operators = subset_def[config_db.db_column_parking_operation].iloc[1:].unique().tolist()
            if len(other_operators)==1:
                return other_operators[0]
            else:
                KeyError('Subset can only have one operator within it')
        else:
            return 1 # return addition as default

    def get_subset_thresholds(self,subset:int):
        return self.reg_def.sort_values(by=config_db.db_column_threshold_value,ascending=False).loc[self.reg_def[config_db.db_column_parking_subset_id]==subset,config_db.db_column_threshold_value].tolist()
    
    def get_max_subset_threshold(self,subset:int):
        return self.reg_def.loc[self.reg_def[config_db.db_column_parking_subset_id]==subset,config_db.db_column_threshold_value].max()

    def get_line_item_by_subset_threshold(self,subset:int,threshold:float):
        return self.reg_def.loc[(self.reg_def[config_db.db_column_parking_subset_id]==subset) &(self.reg_def[config_db.db_column_threshold_value]==threshold)]

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

    def get_units(self)->list[int]:
        units = self.reg_def[config_db.db_column_parking_unit_id].unique().tolist()
        return units
    
    def get_subset_numbers(self)->list[int]:
        subsets = self.reg_def[config_db.db_column_parking_subset_id].unique().tolist()
        return subsets
    
    def check_only_one_regulation(self)->bool:
        n_regulations_head = len(self.reg_head[config_db.db_column_parking_regs_id].unique().tolist())
        n_regulations_def = len(self.reg_def[config_db.db_column_parking_regs_id].unique().tolist())
        if n_regulations_def==1 and n_regulations_head==1:
            return True
        else :
            return False
    
    def get_units_by_subset(self)->tuple[list[int],list[int],list[int],list[int]]:
        n_regs = len(self.reg_def[config_db.db_column_parking_regs_id].unique().tolist())
        if n_regs ==1:
            subsets=self.reg_def[config_db.db_column_parking_subset_id].unique().tolist()
            subsets_out = []
            inter_operators = []
            intra_operators = []
            units_out = []
            for subset in subsets:
                subset_def:pd.DataFrame = self.reg_def.loc[self.reg_def[config_db.db_column_parking_subset_id]==subset].copy().sort_values(by=config_db.db_column_stacked_parking_id)
                subset_len = len(subset_def)
                units = subset_def[config_db.db_column_parking_unit_id].unique().tolist()
                if subset==1 and subset_len ==1:
                    first_operator=1
                    other_operators=1
                    n_operators=1
                elif subset==1 and subset_len>=1:
                    first_operator=1
                    other_operators=subset_def[config_db.db_column_parking_operation].iloc[1:]
                    n_operators = len(other_operators.unique().tolist())
                elif subset_len==1:
                    first_operator =subset_def[config_db.db_column_parking_operation].iloc[0]
                    other_operators=1
                    n_operators=1
                else:
                    first_operator =subset_def[config_db.db_column_parking_operation].iloc[0]
                    other_operators=subset_def[config_db.db_column_parking_operation].iloc[1:]
                    n_operators = len(other_operators.unique().tolist())
                if n_operators>1:
                    ValueError('subset should only have one intra subset operation')
                else:
                    subsets_out.append(subset)
                    inter_operators.append(first_operator)
                    intra_operators.append(other_operators[0])
                    if other_operators[0]==4 and len(units)>1:
                        ValueError('Threshold subsets should only have one unit')
                    else: 
                        units_out.append(units)
            return subsets_out,inter_operators,intra_operators,units
        else:
            SyntaxError('can only use get_units_by_subset if the parking regulation contains one rule only')
    def check_subset_exists(self,subset:int)->bool:
        if subset in self.reg_def[config_db.db_column_parking_subset_id].unique().tolist():
            return True
        else: 
            return False
    def get_subset_units(self,subset:int)->list[int]:
        #print('not yet implemented')
        if self.check_only_one_regulation() and self.check_subset_exists(subset):
            units = self.reg_def.loc[self.reg_def[config_db.db_column_parking_subset_id]==subset,config_db.db_column_parking_unit_id].unique().tolist()
            return units
        else:
            IndexError('Function only implemented for single regs and existing subsets')

    def get_subset_inter_operation_type(self,subset:int)->int:
        subset_def = self.get_subset_def(subset).sort_values(by=config_db.db_column_stacked_parking_id,ascending=True)
        inter_operator_out = int(subset_def[config_db.db_column_parking_operation].iloc[0])
        if subset == 1:
            inter_operator_out = int(3)
        return inter_operator_out
    @singledispatchmethod
    def get_reg_by_id(self,id_to_get_)->Self:
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
def from_postgis(indice_)->ParkingRegulations:
    raise NotImplementedError("Cannot retrieve this data type")

@from_postgis.register
def _(indice_:int):
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        command = f"SELECT * FROM public.entete_reg_stationnement WHERE {config_db.db_column_parking_regs_id} = {indice_}"
        reg_head = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id).reset_index()
        command = f"SELECT * FROM public.reg_stationnement_empile WHERE {config_db.db_column_parking_regs_id} = {indice_}" 
        reg_def = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id).reset_index()
        command = f"SELECT * FROM public.multiplicateur_facteurs_colonnes"
        units_table = pd.read_sql(command,con).reset_index()
    object_out = ParkingRegulations(reg_head,reg_def,units_table)
    return object_out

@from_postgis.register
def _(indice_:list):
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        command = f"SELECT * FROM public.entete_reg_stationnement WHERE {config_db.db_column_parking_regs_id} IN ({','.join(map(str, indice_))})"
        reg_head = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id).reset_index()
        command = f"SELECT * FROM public.reg_stationnement_empile WHERE {config_db.db_column_parking_regs_id} IN ({','.join(map(str, indice_))})" 
        reg_def = pd.read_sql(command,con,index_col = config_db.db_column_parking_regs_id).reset_index()
        command = f"SELECT * FROM public.multiplicateur_facteurs_colonnes"
        units_table = pd.read_sql(command,con).reset_index()
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

