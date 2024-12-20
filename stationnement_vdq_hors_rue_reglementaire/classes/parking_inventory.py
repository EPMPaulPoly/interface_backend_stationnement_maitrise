import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine,text,Engine
from stationnement_vdq_hors_rue_reglementaire.config import config_db
from stationnement_vdq_hors_rue_reglementaire.classes import parking_inventory as PI
from typing_extensions import Self

class ParkingInventory():
    '''
        # ParkingInventory
            Objet contenant un inventaire de stationnement. Pour l'instant l'inventaire de stationnment est aggrégé au niveau du lot cadastral pour l'instant pour permettre de créer un inventaire basé sur les réglements de stationnement. 
    '''
    def __init__(self,parking_inventory_frame: pd.DataFrame)->Self:
        f'''
            # __init__
            Fonction d'instanciation de l'object ParkingInventory.
            Inputs:
                - parking_inventory_frame: dataframe with columns:g_no_lot, n_places_min,n_places_max,methode_estime,id_ens_reg,id_reg_stat,rl,commentaire
        '''
        fields_to_confirm = [config_db.db_column_lot_id,'n_places_min','n_places_max','methode_estime',config_db.db_column_reg_sets_id,config_db.db_column_parking_regs_id,config_db.db_column_land_use_id, 'commentaire']
        if all(item in parking_inventory_frame.columns for item in fields_to_confirm):
            self.parking_frame = parking_inventory_frame
        else: 
            KeyError("Colonnes suivantes doivent être présentes dans l'estimé ['id_cadastre','n_places','methode_estime','ens_reg_estim','reg_estim','commentaire']")
    def __repr__(self):
        return f'N_lots ={len(self.parking_frame[config_db.db_column_lot_id].unique())}, N_places_min = {self.parking_frame['n_places_min'].agg('sum')}'
    
    def subset_operation(self,operator,inventory_2:Self) ->Self:
        if isinstance(operator,int):
            match operator:
                case 1:
                    NotImplementedError('Subset Operator no implemented')
                case 2:
                    NotImplementedError('Obsolete operator')
                case 3:
                    NotImplementedError('Subset Operator no implemented')
                case 4:
                    NotImplementedError('Subset Operator no implemented')
                case 5:
                    NotImplementedError('Obsolete operator')
                case 6:
                    NotImplementedError('Subset Operator no implemented')
        else:
            ValueError(f'Operator must be integer, you supplied {type(operator)}')
                

    def to_postgis(self,con:Engine=None):
        '''
        # to_postgis
        Fonction qui envoie l'inventaire de stationnement sur la base de données
        '''
        if isinstance(con,Engine):
            print('Using existing connection engine')
        else: 
            con = create_engine(config_db.pg_string)
        self.parking_frame.to_sql(config_db.db_table_parking_inventory,con=con,if_exists='replace',index=False)