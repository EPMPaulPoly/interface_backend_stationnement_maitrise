import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine,text,Engine
from stationnement_vdq_hors_rue_reglementaire.config import config_db
from stationnement_vdq_hors_rue_reglementaire.classes import parking_inventory as PI
from typing_extensions import Self
import logging
import numpy as np
import sqlalchemy

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
            self.parking_frame:pd.DataFrame = parking_inventory_frame
        else: 
            KeyError("Colonnes suivantes doivent être présentes dans l'estimé ['id_cadastre','n_places','methode_estime','ens_reg_estim','reg_estim','commentaire']")
       
    def __repr__(self):
        return f'N_lots ={len(self.parking_frame[config_db.db_column_lot_id].unique())}, N_places_min = {self.parking_frame['n_places_min'].agg('sum')}'
    
    def subset_operation(self,operator,inventory_2:Self) ->Self:
        logger = logging.getLogger(__name__)
        if isinstance(operator,int):
            match operator:
                case 1:
                    raise NotImplementedError('Subset Operator no implemented')
                case 2:
                    raise NotImplementedError('Obsolete operator')
                case 3:
                    logger.info('entering MOST CONSTRAINING OR operation')
                    if (self.parking_frame['n_places_min'].isnull().all() and inventory_2.parking_frame['n_places_max'].isnull().all()): # one is a min, one is a max if min > max
                        logger.info('Entrée dans l''opération de subset par défaut')
                        # create dataframe
                        parking_frame_out = pd.DataFrame()
                        # pull data from left
                        parking_frame_out = self.parking_frame[[config_db.db_column_lot_id,'n_places_max']].copy()
                        parking_frame_out.rename(columns={'n_places_max':'n_places_max_left'},inplace=True)
                        # pull data from right
                        parking_frame_right =inventory_2.parking_frame[[config_db.db_column_lot_id,'n_places_min']].copy()
                        parking_frame_right.rename(columns={'n_places_min':'n_places_min_right'},inplace=True)
                        #merge data
                        parking_frame_out = parking_frame_out.merge(parking_frame_right,on=config_db.db_column_lot_id)
                        # case 1 min<=max
                        parking_frame_out.loc[parking_frame_out['n_places_min_right']<=parking_frame_out['n_places_max_left'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_right']<=parking_frame_out['n_places_max_left'],'n_places_min_right'] 
                        parking_frame_out.loc[parking_frame_out['n_places_min_right']<=parking_frame_out['n_places_max_left'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_right']<=parking_frame_out['n_places_max_left'],'n_places_max_left'] 
                        # case 2 min>max
                        parking_frame_out.loc[parking_frame_out['n_places_min_right']>parking_frame_out['n_places_max_left'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_right']<=parking_frame_out['n_places_max_left'],'n_places_max_left'] 
                        parking_frame_out.loc[parking_frame_out['n_places_min_right']>parking_frame_out['n_places_max_left'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_right']<=parking_frame_out['n_places_max_left'],'n_places_max_left'] 
                        # clean up the right left stuff
                        parking_frame_out.drop(columns=['n_places_min_right','n_places_max_left'],inplace=True)
                        # copy old parking frame
                        old_parking_frame = self.parking_frame.copy()
                        # merge the data to the old parking frame
                        new_parking_frame = old_parking_frame.merge(parking_frame_out,how='left',on=config_db.db_column_lot_id)
                        # drop the old data
                        new_parking_frame.drop(columns=['n_places_min','n_places_max'],inplace=True)
                        # rename columns
                        new_parking_frame.rename(columns={'n_places_min_final':'n_places_min','n_places_max_final':'n_places_max'},inplace=True)
                        #create parking inventory object
                        parking_inventory_object = ParkingInventory(new_parking_frame)
                    elif (self.parking_frame['n_places_max'].isnull().all() and inventory_2.parking_frame['n_places_min'].isnull().all()): # one is a min, one is a max if min > max
                        logger.info('Entrée dans l''opération de subset par défaut')
                        # create dataframe
                        parking_frame_out = pd.DataFrame()
                        # pull data from left
                        parking_frame_out = self.parking_frame[[config_db.db_column_lot_id,'n_places_min']].copy()
                        parking_frame_out.rename(columns={'n_places_min':'n_places_min_left'},inplace=True)
                        # pull data from right
                        parking_frame_right =inventory_2.parking_frame[[config_db.db_column_lot_id,'n_places_max']].copy()
                        parking_frame_right.rename(columns={'n_places_max':'n_places_max_right'},inplace=True)
                        #merge data
                        parking_frame_out = parking_frame_out.merge(parking_frame_right,on=config_db.db_column_lot_id)
                        # case 1 min<=max
                        parking_frame_out.loc[parking_frame_out['n_places_min_left']<=parking_frame_out['n_places_max_right'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<=parking_frame_out['n_places_max_right'],'n_places_min_left'] 
                        parking_frame_out.loc[parking_frame_out['n_places_min_left']<=parking_frame_out['n_places_max_right'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<=parking_frame_out['n_places_max_right'],'n_places_max_right'] 
                        # case 2 min>max
                        parking_frame_out.loc[parking_frame_out['n_places_min_left']>parking_frame_out['n_places_max_right'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<=parking_frame_out['n_places_max_right'],'n_places_max_right'] 
                        parking_frame_out.loc[parking_frame_out['n_places_min_left']>parking_frame_out['n_places_max_right'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<=parking_frame_out['n_places_max_right'],'n_places_max_right'] 
                        # clean up the right left stuff
                        parking_frame_out.drop(columns=['n_places_min_left','n_places_max_right'],inplace=True)
                        # copy old parking frame
                        old_parking_frame = self.parking_frame.copy()
                        # merge the data to the old parking frame
                        new_parking_frame = old_parking_frame.merge(parking_frame_out,how='left',on=config_db.db_column_lot_id)
                        # drop the old data
                        new_parking_frame.drop(columns=['n_places_min','n_places_max'],inplace=True)
                        # rename columns
                        new_parking_frame.rename(columns={'n_places_min_final':'n_places_min','n_places_max_final':'n_places_max'},inplace=True)
                        #create parking inventory object
                        parking_inventory_object = ParkingInventory(new_parking_frame)
                    else: # default case, i have a min and a max
                        logger.info('Entrée dans l''opération de subset par défaut')
                        # create an emptry dataframe
                        parking_frame_out = pd.DataFrame()
                        # copy over self.parking_frame, mins and maxes, rename left
                        parking_frame_out = self.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
                        parking_frame_out.rename(columns={'n_places_min':'n_places_min_left','n_places_max':'n_places_max_left'},inplace=True)
                        # copy over inventory_2.parking_frame, mins and maxes, rename right
                        parking_frame_right =inventory_2.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
                        parking_frame_right.rename(columns={'n_places_min':'n_places_min_right','n_places_max':'n_places_max_right'},inplace=True)
                        # merge the dataframes
                        parking_frame_out = parking_frame_out.merge(parking_frame_right,on=config_db.db_column_lot_id)
                        # mins and maxes and cleanup
                        parking_frame_out['n_places_min_final'] = parking_frame_out[['n_places_min_left','n_places_min_right']].max(axis=1)
                        parking_frame_out['n_places_max_final'] = parking_frame_out[['n_places_max_left','n_places_max_right']].min(axis=1)
                        parking_frame_out.drop(columns=['n_places_min_left','n_places_min_right','n_places_max_left','n_places_max_right'],inplace=True)
                        # copy th old frame
                        old_parking_frame = self.parking_frame.copy()
                        # merge new onto old
                        new_parking_frame = old_parking_frame.merge(parking_frame_out,how='left',on=config_db.db_column_lot_id)
                        # drop old
                        new_parking_frame.drop(columns=['n_places_min','n_places_max'],inplace=True)
                        #name cleanup
                        new_parking_frame.rename(columns={'n_places_min_final':'n_places_min','n_places_max_final':'n_places_max'},inplace=True)
                        #create object
                        parking_inventory_object = ParkingInventory(new_parking_frame)
                    logger.info('Complétion du cas de base')
                    return parking_inventory_object
                case 4:
                    raise NotImplementedError('Subset Operator no implemented')
                case 5:
                    raise NotImplementedError('Obsolete operator')
                case 6:
                    logger.info('Entrée dans l''opération de subset par défaut')
                    parking_frame_out = pd.DataFrame()
                    parking_frame_out = self.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
                    parking_frame_out.rename(columns={'n_places_min':'n_places_min_left','n_places_max':'n_places_max_left'},inplace=True)
                    parking_frame_right =inventory_2.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
                    parking_frame_right.rename(columns={'n_places_min':'n_places_min_right','n_places_max':'n_places_max_right'},inplace=True)
                    parking_frame_out = parking_frame_out.merge(parking_frame_right,on=config_db.db_column_lot_id)
                    # implémenté comme prenant le minimum des requis minimaux. Ceci et mis en place selon la logique qu'un développeur immobilier voudrait potentiellement 
                    # Cas 1 la gauche est plus petit: min_final = min_left, max_final = max_left
                    parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_min_left']
                    parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_max_left']
                    # Cas 1 la droite est plus petit: min_final = min_right, max_final = max_right
                    parking_frame_out.loc[parking_frame_out['n_places_min_left']>=parking_frame_out['n_places_min_right'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_min_right']
                    parking_frame_out.loc[parking_frame_out['n_places_min_left']>=parking_frame_out['n_places_min_right'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_max_right']
                    # ramène le vieux frame
                    old_parking_frame = self.parking_frame.copy()
                    # drop gauche/droite
                    parking_frame_out.drop(columns=['n_places_min_left','n_places_min_right','n_places_max_left','n_places_max_right'],inplace=True)
                    new_parking_frame = old_parking_frame.merge(parking_frame_out,how='left',on=config_db.db_column_lot_id)
                    new_parking_frame.drop(columns=['n_places_min','n_places_max'],inplace=True)
                    new_parking_frame.rename(columns={'n_places_min_final':'n_places_min','n_places_max_final':'n_places_max'},inplace=True)
                    parking_inventory_object = ParkingInventory(new_parking_frame)
                    return parking_inventory_object
        else:
            raise ValueError(f'Operator must be integer, you supplied {type(operator)}')
                
    def concat(self,inventory_2:Self)->Self:
        logger = logging.getLogger(__name__)
        if self.parking_frame.empty==False and inventory_2.parking_frame.empty ==False:
            logger.info('Inventory concatenation - 2 inventories with data')
            self.parking_frame = pd.concat([self.parking_frame,inventory_2.parking_frame])
        elif self.parking_frame.empty==True:
            logger.info('Inventory concatenation - Main inventory empty, setting to inventory 2 frame')
            self.parking_frame = inventory_2.parking_frame
        else:
            logger.warning('Inventory concatenation - Both datasets are empty - continuing')

    def to_postgis(self,con:Engine=None):
        '''
        # to_postgis
        Fonction qui envoie l'inventaire de stationnement sur la base de données
        '''
        logger = logging.getLogger(__name__)
        if isinstance(con,Engine):
            logger.info('Using existing connection engine')
        else: 
            con = create_engine(config_db.pg_string)
        self.parking_frame.to_sql(config_db.db_table_parking_inventory,con=con,if_exists='replace',index=False)

    def merge_lot_data(self:Self)->None:
        '''
        #merge_lot_data
            Utilisé pour faire le ménage de duplication de lots lorque plusieurs entrées d'inventaire sont présentes pour un même lot du rôle foncier.
        '''
        logger = logging.getLogger(__name__)
        self.parking_frame.reset_index(inplace=True)
        self.parking_frame.drop(columns='index',inplace=True)
        lots_to_clean_up = self.parking_frame.loc[self.parking_frame[config_db.db_column_lot_id].duplicated(keep=False)]
        lots_list_to_purge_from_self = lots_to_clean_up[config_db.db_column_lot_id].unique().tolist()
        aggregate_parking_data = lots_to_clean_up.groupby([config_db.db_column_lot_id]).apply(inventory_duplicates_agg_function).reset_index()
        aggregate_parking_data.loc[(aggregate_parking_data['n_places_min']>aggregate_parking_data['n_places_max']) & (aggregate_parking_data['n_places_max']==0.0),'n_places_max'] =None
        new_parking_frame = self.parking_frame.drop(self.parking_frame[self.parking_frame[config_db.db_column_lot_id].isin(lots_list_to_purge_from_self)].index)
        new_parking_frame = pd.concat([new_parking_frame,aggregate_parking_data])

        self.parking_frame = new_parking_frame 
        logger.info(f'found following items which have two estimates : {lots_list_to_purge_from_self} - estimates were summed')

def dissolve_list(list_to_dissolve:list[ParkingInventory])->ParkingInventory:
    for inx,item_to_concat in enumerate(list_to_dissolve):
        if inx==0:
            inventory_to_out = item_to_concat
        else:
            inventory_to_out.concat(item_to_concat)
    return inventory_to_out

def inventory_duplicates_agg_function(x:pd.DataFrame):
    d = {}
    d[config_db.db_column_land_use_id] = '/'.join(map(str, x[config_db.db_column_land_use_id]))
    d[config_db.db_column_reg_sets_id] = '/'.join(map(str, x[config_db.db_column_reg_sets_id]))
    d[config_db.db_column_parking_regs_id] = '/'.join(map(str, x[config_db.db_column_parking_regs_id]))
    d['n_places_min'] = x['n_places_min'].sum()
    d['n_places_max'] = x['n_places_max'].sum()
    d['commentaire'] = x['commentaire'].values[0]
    d['methode_estime'] = x['methode_estime'].values[0]
    return pd.Series(d,index = [config_db.db_column_land_use_id,config_db.db_column_reg_sets_id,config_db.db_column_parking_regs_id,'n_places_min','n_places_max','commentaire','methode_estime'])

def to_sql(inventory_to_save:ParkingInventory,engine:sqlalchemy.Engine=None):
    ''' # to_sql
        inserts parking frame into relevant 
    '''
    if engine is None:
        engine = sqlalchemy.create_engine(config_db.pg_string)
        
    with engine.connect() as con:
        sql_return = inventory_to_save.parking_frame.to_sql(config_db.db_table_parking_inventory,con=con,schema='public',if_exists='replace',index=False)
    return sql_return