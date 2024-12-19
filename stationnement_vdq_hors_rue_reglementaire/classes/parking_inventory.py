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
    def __init__(self,parking_inventory_frame: pd.DataFrame):
        '''
            # __init__
            Fonction d'instanciation de l'object ParkingInventory
        '''
        if all(item in parking_inventory_frame.columns for item in [config_db.db_column_lot_id,'n_places_min','n_places_max','methode_estime',config_db.db_column_reg_sets_id,config_db.db_column_parking_regs_id,config_db.db_column_land_use_id, 'commentaire']):
            self.parking_frame = parking_inventory_frame
        else: 
            KeyError("Colonnes suivantes doivent être présentes dans l'estimé ['id_cadastre','n_places','methode_estime','ens_reg_estim','reg_estim','commentaire']")

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