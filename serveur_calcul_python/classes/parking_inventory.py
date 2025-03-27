import os
#print(os.getcwd())
import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine,text,Engine,MetaData,Table
import sqlalchemy as db_alchemy
from config import config_db
from classes import parking_inventory as PI
from typing_extensions import Self
import logging
import numpy as np
import sqlalchemy
from classes import tax_dataset as TD
from classes import reg_set_territory as RST
from classes import parking_reg_sets as PRS
from classes import parking_regs as PR
import webbrowser
from classes import parking_inventory_inputs as PII

from typing import Union

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

    def to_postgis(self,con:db_alchemy.Engine=None):
        '''
        # to_postgis
        Fonction qui envoie l'inventaire de stationnement sur la base de données
        '''
        logger = logging.getLogger(__name__)
        if isinstance(con,db_alchemy.Engine):
            logger.info('Using existing connection engine')
        else: 
            con = db_alchemy.create_engine(config_db.pg_string)
        self.parking_frame.to_sql(config_db.db_table_parking_inventory,con=con,if_exists='replace',index=False)

    def to_json(self)->str :
        return self.parking_frame.to_json(orient='records',force_ascii=False)
    
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
        if len(lots_list_to_purge_from_self)>0:
            aggregate_parking_data = lots_to_clean_up.groupby([config_db.db_column_lot_id]).apply(inventory_duplicates_agg_function).reset_index()
            aggregate_parking_data.loc[(aggregate_parking_data['n_places_min']>aggregate_parking_data['n_places_max']) & (aggregate_parking_data['n_places_max']==0.0),'n_places_max'] =None
            new_parking_frame = self.parking_frame.drop(self.parking_frame[self.parking_frame[config_db.db_column_lot_id].isin(lots_list_to_purge_from_self)].index)
            new_parking_frame = pd.concat([new_parking_frame,aggregate_parking_data])

            self.parking_frame = new_parking_frame 
            logger.info(f'found following items which have two estimates : {lots_list_to_purge_from_self} - estimates were summed')
        else: 
            logger.info('No duplicate entries, continue,continuting on')

def subset_operation(inventory_1:ParkingInventory,operator,inventory_2:ParkingInventory) ->ParkingInventory:
    logger = logging.getLogger(__name__)
    if isinstance(operator,int):
        match operator:
            case 1:
                raise NotImplementedError('Subset Operator no implemented')
            case 2:
                raise NotImplementedError('Obsolete operator')
            case 3:
                logger.info('entering MOST CONSTRAINING OR operation')
                if (inventory_1.parking_frame['n_places_min'].isnull().all() and inventory_2.parking_frame['n_places_max'].isnull().all()): # one is a min, one is a max if min > max
                    logger.info('Entrée dans l''opération de subset par défaut')
                    # create dataframe
                    parking_frame_out = pd.DataFrame()
                    # pull data from left
                    parking_frame_out = inventory_1.parking_frame[[config_db.db_column_lot_id,'n_places_max']].copy()
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
                    old_parking_frame = inventory_1.parking_frame.copy()
                    # merge the data to the old parking frame
                    new_parking_frame = old_parking_frame.merge(parking_frame_out,how='left',on=config_db.db_column_lot_id)
                    # drop the old data
                    new_parking_frame.drop(columns=['n_places_min','n_places_max'],inplace=True)
                    # rename columns
                    new_parking_frame.rename(columns={'n_places_min_final':'n_places_min','n_places_max_final':'n_places_max'},inplace=True)
                    #create parking inventory object
                    parking_inventory_object = ParkingInventory(new_parking_frame)
                elif (inventory_1.parking_frame['n_places_max'].isnull().all() and inventory_2.parking_frame['n_places_min'].isnull().all()): # one is a min, one is a max if min > max
                    logger.info('Entrée dans l''opération de subset par défaut')
                    # create dataframe
                    parking_frame_out = pd.DataFrame()
                    # pull data from left
                    parking_frame_out = inventory_1.parking_frame[[config_db.db_column_lot_id,'n_places_min']].copy()
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
                    old_parking_frame = inventory_1.parking_frame.copy()
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
                    parking_frame_out = inventory_1.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
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
                    old_parking_frame = inventory_1.parking_frame.copy()
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
                logger.info('Entrée dans l''opération OU SIMPLE')
                parking_frame_out = pd.DataFrame()
                parking_frame_out = inventory_1.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
                parking_frame_out.rename(columns={'n_places_min':'n_places_min_left','n_places_max':'n_places_max_left'},inplace=True)
                parking_frame_right =inventory_2.parking_frame[[config_db.db_column_lot_id,'n_places_min','n_places_max']].copy()
                parking_frame_right.rename(columns={'n_places_min':'n_places_min_right','n_places_max':'n_places_max_right'},inplace=True)
                parking_frame_out = parking_frame_out.merge(parking_frame_right,on=config_db.db_column_lot_id)
                # implémenté comme prenant le minimum des requis minimaux. Ceci et mis en place selon la logique qu'un développeur immobilier voudrait potentiellement 
                # Cas 1 la gauche_min est plus petit: min_final = min_left, max_final = max_left
                parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_min_left']
                parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']<parking_frame_out['n_places_min_right'],'n_places_max_left']
                # Cas 2 la droite_min est plus petit: min_final = min_right, max_final = max_right
                parking_frame_out.loc[parking_frame_out['n_places_min_left']>=parking_frame_out['n_places_min_right'],'n_places_min_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']>=parking_frame_out['n_places_min_right'],'n_places_min_right']
                parking_frame_out.loc[parking_frame_out['n_places_min_left']>=parking_frame_out['n_places_min_right'],'n_places_max_final'] = parking_frame_out.loc[parking_frame_out['n_places_min_left']>=parking_frame_out['n_places_min_right'],'n_places_max_right']
                # ramène le vieux frame
                old_parking_frame = inventory_1.parking_frame.copy()
                # drop gauche/droite
                parking_frame_out.drop(columns=['n_places_min_left','n_places_min_right','n_places_max_left','n_places_max_right'],inplace=True)
                new_parking_frame = old_parking_frame.merge(parking_frame_out,how='left',on=config_db.db_column_lot_id)
                new_parking_frame.drop(columns=['n_places_min','n_places_max'],inplace=True)
                new_parking_frame.rename(columns={'n_places_min_final':'n_places_min','n_places_max_final':'n_places_max'},inplace=True)
                parking_inventory_object = ParkingInventory(new_parking_frame)
                return parking_inventory_object
    else:
        raise ValueError(f'Operator must be integer, you supplied {type(operator)}')
        
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

def calculate_inventory_by_analysis_sector(sector_to_calculate:int, create_html:bool = False,overwrite:int=0)->ParkingInventory:
    '''
        # calculate_inventory_by_analysis_sector
        Permet de calculer le stationnement pour chaque lot danas un quartier d'analyse donné
    '''
    # find all points within sector
    logging.info('Getting tax data sets within neighbourhoods')
    tax_data_to_analyse: TD.TaxDataset = TD.tax_database_for_analysis_territory(sector_to_calculate)
    # find all territories that touch the data
    logging.info('Finding relevant parking rulesets')
    [RSTs,TDs] = RST.get_rst_by_tax_data(tax_data_to_analyse)
    #creating  parking inventories
    logging.info('Calculating parking inventory')
    parking_inventories:list[PI.ParkingInventory] = calculate_parking_for_reg_set_territories(RSTs,TDs)
    logging.info('Inventory completed - merging inventory list into one list')
    final_parking_inventory = PI.dissolve_list(parking_inventories)
    logging.info('Merging inventories for a given lot')
    final_parking_inventory.merge_lot_data()
    return final_parking_inventory

def calculate_inventory_by_lot(lot_to_calculate:str, create_html:bool = False,overwrite:int=0)->ParkingInventory:
    '''
        # calculate_inventory_by_lot
            calculates the inventory for a lot
    '''
    # find all points within sector
    logging.info(f'Starting parking inventory calculation for lot: {lot_to_calculate}')
    logging.info('Getting tax data sets within neighbourhoods')
    tax_data_to_analyse = TD.tax_database_from_lot_id(lot_to_calculate)
    # find all territories that touch the data
    logging.info('Finding relevant parking rulesets')
    [RSTs,TDs] = RST.get_rst_by_tax_data(tax_data_to_analyse)
    #creating  parking inventories
    logging.info('Calculating parking inventory')
    parking_inventories:list[PI.ParkingInventory] = calculate_parking_for_reg_set_territories(RSTs,TDs)
    logging.info('Inventory completed - merging inventory list into one list')
    final_parking_inventory = PI.dissolve_list(parking_inventories)
    logging.info('Merging inventories for a given lot')
    final_parking_inventory.merge_lot_data()
    return final_parking_inventory

def to_sql(inventory_to_save:ParkingInventory,engine:sqlalchemy.Engine=None,overwrite:int=0):
    ''' # to_sql
        inserts parking frame into relevant 
    '''
    logger = logging.getLogger(__name__)
    if engine is None:
        engine = sqlalchemy.create_engine(config_db.pg_string)
        
    
    query_existing_inventory = f"SELECT * FROM public.{config_db.db_table_parking_inventory}"
    with engine.connect() as con:
        existing_inventory:pd.DataFrame = pd.read_sql(query_existing_inventory,con=con)
    existing_g_no_lot = existing_inventory[config_db.db_column_lot_id].unique().tolist()
    already_existing_inventory = inventory_to_save.parking_frame.loc[((inventory_to_save.parking_frame[config_db.db_column_lot_id].isin(existing_g_no_lot)) & (inventory_to_save.parking_frame['methode_estime']==2))]
    not_existing_inventory = inventory_to_save.parking_frame.loc[(~(inventory_to_save.parking_frame[config_db.db_column_lot_id].isin(existing_g_no_lot)) & (inventory_to_save.parking_frame['methode_estime']==2))]
    if already_existing_inventory.empty:
        inventory_to_save.parking_frame.to_sql(config_db.db_table_parking_inventory,con=engine,schema='public',if_exists='append',index=False)
        print('save_complete')
    else:
        if overwrite==1:
            logger.info(f'Les lots suivants sont déja dans la base de données \n {already_existing_inventory[config_db.db_column_lot_id].to_list()}\n')
            question_unanswered = True
            while question_unanswered:
                answer= str(input('Voulez vous remplacer les estimés pour lots en question[o/n]?'))
                if answer == 'o':
                    question_unanswered=False
                    lots_to_alter = already_existing_inventory[config_db.db_column_lot_id].unique().tolist()
                    query = f"DELETE FROM public.{config_db.db_table_parking_inventory} WHERE {config_db.db_column_lot_id} IN ('{"','".join(map(str,lots_to_alter))}') AND methode_estime = 2;"
                    statement = db_alchemy.text(query)
                    #meta = MetaData()
                    with engine.connect() as con:
                        dude = con.execute(statement)
                        con.commit()
                    inventory_to_save.parking_frame.to_sql(config_db.db_table_parking_inventory,con=engine,schema='public',if_exists='append',index=False)
                elif answer =='n':
                    logger.info(f'Nous sauverons seulement les éléments non-dupliqués')
                    question_unanswered=False
                    if not not_existing_inventory.empty:
                        not_existing_inventory.to_sql(config_db.db_table_parking_inventory,con=engine,schema='public',if_exists='append',index=False)
                else:
                    logger.info('Entrée invalide, seul y et n sont des entrés valides')
        else:
            logger.info("Seuls les items nos dupliqués seront sauvegardés, changez l'option overwrite pour supprimer les anciens estimés")
            if not not_existing_inventory.empty:
                not_existing_inventory.to_sql(config_db.db_table_parking_inventory,con=engine,schema='public',if_exists='append',index=False)

def calculate_parking_for_reg_set_territories(reg_set_territories:Union[RST.RegSetTerritory,list[RST.RegSetTerritory]],tax_datas:Union[TD.TaxDataset,list[TD.TaxDataset]])->Union[PI.ParkingInventory,list[PI.ParkingInventory]]:
    logger = logging.getLogger(__name__)
    logger.info('-----------------------------------------------------------------------------------------------')
    logger.info('Entering Inventory')
    logger.info('-----------------------------------------------------------------------------------------------')
    if isinstance(reg_set_territories,RST.RegSetTerritory) and isinstance(tax_datas,TD.TaxDataset):
        logger.info('-----------------------------------------------------------------------------------------------')
        logger.info(f'Starting inventory for regset territory: {reg_set_territories}')
        logger.info('-----------------------------------------------------------------------------------------------')
        parking_inventory_to_return = calculate_parking_specific_reg_set(reg_set_territories.parking_regulation_set,tax_datas)
        return parking_inventory_to_return
    parking_inventory_list = []
    for sub_reg_set ,sub_tax_data in zip(reg_set_territories,tax_datas):
        
        if len(sub_tax_data.tax_table)>0 and len(sub_tax_data.lot_table)>0:
            logger.info('-----------------------------------------------------------------------------------------------')
            logger.info(f'Starting inventory for regset territory: {sub_reg_set}')
            logger.info('-----------------------------------------------------------------------------------------------')
            # find unique parking regs and recursively call function with only one
            parking_inventory_to_append = calculate_parking_specific_reg_set(sub_reg_set.parking_regulation_set,sub_tax_data)
            parking_inventory_list.append(parking_inventory_to_append)
    return parking_inventory_list


def calculate_parking_specific_reg_set(reg_set:PRS.ParkingRegulationSet,tax_data:TD.TaxDataset,reg_set_territory_to_transfer:int=0)->PI.ParkingInventory:
    logger = logging.getLogger(__name__)
    logger.info('-----------------------------------------------------------------------------------------------')
    logger.info(f'Starting inventory for regset: {reg_set}')
    logger.info('-----------------------------------------------------------------------------------------------')
    land_uses_to_get_regs_for = tax_data.get_land_uses_in_set()
    unique_parking_regs = reg_set.get_unique_reg_ids_using_land_use(land_uses_to_get_regs_for) 
    parking_inventory_final = PI.ParkingInventory(pd.DataFrame(columns=[config_db.db_column_lot_id,config_db.db_column_reg_sets_id,config_db.db_column_parking_regs_id,config_db.db_column_land_use_id,'n_places_min','n_places_max','methode_estime','commentaire']))
    for reg_id in unique_parking_regs:
        relevant_land_uses = reg_set.expanded_table.loc[reg_set.expanded_table[config_db.db_column_parking_regs_id]== reg_id,config_db.db_column_land_use_id].tolist()
        with pd.option_context('display.max_rows', None, 'display.max_columns', None):  # more options can be specified also
            reg_set.land_use_table.style.set_properties(**{'text-align': 'left'})
            logger.info(f'Parking rule #{int(reg_id)} has following relevant land uses:\n {reg_set.land_use_table.loc[reg_set.land_use_table[config_db.db_column_land_use_id].isin(relevant_land_uses)].to_string(index=False,col_space=[10,120],justify='left')}')
        relevant_tax_data_points = tax_data.select_by_land_uses(relevant_land_uses)
        parking_reg = reg_set.get_parking_reg_by_id(reg_id)
        parking_inventory = calculate_parking_specific_reg(parking_reg,relevant_tax_data_points,reg_set.ruleset_id)
        parking_inventory_final.concat(parking_inventory)
    return parking_inventory_final

def calculate_parking_specific_reg(reg_to_calculate: PR.ParkingRegulations,tax_data:TD.TaxDataset,rule_set_to_transfer:int = 0)->Self :
    '''
        # calculate_minimum_parking
        Calcule le minimum de stationnement pour un ensemble de points du rôle foncier.
    '''
    logger = logging.getLogger(__name__)
    
    # Only compute if there's one reg. Inefficient but easy to handle at the moment
    if len(reg_to_calculate.reg_head[config_db.db_column_parking_regs_id].unique().tolist())>1:
        raise IndexError('Should only have one regulation at a time')
    else:
        # number of subsets
        parking_reg_id = reg_to_calculate.reg_def[config_db.db_column_parking_regs_id].values[0]
        logger.info(f'Starting parking calculation for {config_db.db_column_parking_regs_id} = {parking_reg_id}')
        reg_to_calculate.reg_head.style.set_properties(**{'text-align': 'left'})
        logger.info(f'Description of parking regulation: {reg_to_calculate.reg_head[config_db.db_column_parking_description].values[0]}')
        logger.info(f'Using tax data for {tax_data}')
        n_ensembles = len(reg_to_calculate.reg_def[config_db.db_column_parking_subset_id].unique().tolist())
        if n_ensembles == 1:
            # straight assessment if only one subset in the rule
            subset_id = reg_to_calculate.reg_def[config_db.db_column_parking_subset_id].iloc[0]
            parking_inventory = calculate_parking_specific_reg_subset(reg_to_calculate,subset_id,tax_data,rule_set_to_transfer)
        else:
            if parking_reg_id=='1182':
                logger.info('Debugging 1182 - subset interpretation')
            # loop through subsets and manage operators between
            for iter_subset_id in reg_to_calculate.reg_def[config_db.db_column_parking_subset_id].unique().tolist():
                if iter_subset_id == 1: # if first subset, set as inventory to start
                    subset_inventory = calculate_parking_specific_reg_subset(reg_to_calculate,iter_subset_id,tax_data,rule_set_to_transfer)
                    parking_inventory = subset_inventory
                else:
                    operator = int(reg_to_calculate.reg_def.loc[reg_to_calculate.reg_def[config_db.db_column_parking_subset_id]==iter_subset_id,config_db.db_column_parking_operation].iloc[0])
                    subset_inventory = calculate_parking_specific_reg_subset(reg_to_calculate,iter_subset_id,tax_data,rule_set_to_transfer)
                    parking_inventory = subset_operation(parking_inventory,operator=operator,inventory_2 = subset_inventory) # if subsequen subset, you need to check which operator it is for the subset and choose which inventory to keep
    return parking_inventory

def calculate_parking_specific_reg_subset(parking_reg:PR.ParkingRegulations,subset:int,tax_data:TD.TaxDataset,rule_set_id:int)->ParkingInventory:
    '''
        # calculate_parking_minimum_subset
        calculates the parking requirements for one subset of a rule (as opposed to the entire rule)
    '''
    logger = logging.getLogger(__name__)
    # get the subset that is relevant. only need definition
    parking_subset = parking_reg.reg_def.loc[parking_reg.reg_def[config_db.db_column_parking_subset_id]==subset].copy().sort_values(by=config_db.db_column_stacked_parking_id)
    # Bool check to see stop run 
    run_assessment = False
    # number of rows in parking rule subset
    n_rows = len(parking_subset)
    # get a subset number (1...n)
    parking_subset_number = parking_subset[config_db.db_column_parking_subset_id].iloc[0]
    # check data format before application
    if n_rows>1 and parking_subset_number>1: # if this is a second subset, need to split out operators between one that applies between subsets to one that applies within subset. There should be only one operator within subset
        operators = parking_subset[config_db.db_column_parking_operation]
        first_operator = operators.iloc[0]
        other_operators = operators.iloc[1:]
        n_other_operators = len(other_operators.unique().tolist())
    elif n_rows==1 and parking_subset_number ==1: # if it's the frist subset, you can just create a dummy addition subset operation and 
        operators = parking_subset[config_db.db_column_parking_operation]
        first_operator = 1 # simple addition on first set
        other_operators =1 # simple addition on first set if there's only one row
        n_other_operators = 1
    elif n_rows>1 and parking_subset_number ==1: # first subset multiple conditions
        operators = parking_subset[config_db.db_column_parking_operation]
        first_operator = 1 # simple add on ruleset operation
        other_operators = operators.iloc[1:]
        n_other_operators = len(other_operators.unique().tolist())
    else: # in thise case it's nothe first requirement and there's only one line in the thing
        operators = parking_subset[config_db.db_column_parking_operation]
        first_operator = operators.iloc[0]
        other_operators = 1 # simple addition
        n_other_operators = 1
    # Throw error if tehre's more than one operator if not, setup operation as the first value in the other_operators list
    if n_other_operators==1:
        run_assessment=True
        if isinstance(other_operators,int):
            operation = other_operators
        else:
            operation = int(other_operators.iloc[0])
        logger.info(f'Operation being performed for subset {subset} of rule #{parking_subset[config_db.db_column_parking_regs_id].iloc[0]}: {operation} (1:sum, 4: change of rule based on threshold)')
    else:
        raise ValueError('Too many operators. Multiple operators not supported within subset except for first')
    '''operations options: 
        1: + absolu
        2: obsolete
        3: OR most constraining
        4: change criteria above value  
        5: obsolet
        6: OR simple'''
    # Enter calculation loop
    if run_assessment:
        # Create container dataframe for now before sending to Inventory. Calculating by tax id to start
        parking_inventory_df:pd.DataFrame=pd.DataFrame(columns=[config_db.db_column_tax_id,'column_to_use','unconverted_value','converted_assessement_column','n_places_min','n_places_max',config_db.db_column_reg_sets_id,config_db.db_column_parking_regs_id,config_db.db_column_parking_subset_id])
        # copy Tax Ids to start
        parking_inventory_df[config_db.db_column_tax_id] = tax_data.tax_table[config_db.db_column_tax_id].copy()
        parking_inventory_df[config_db.db_column_parking_subset_id] = subset
        parking_inventory_df[config_db.db_column_reg_sets_id] = str(rule_set_id)
        parking_inventory_df[config_db.db_column_parking_regs_id] = str(parking_reg.reg_head[config_db.db_column_parking_regs_id].values[0])
        parking_inventory_df['n_places_min']=np.nan
        parking_inventory_df['n_places_max']=np.nan
            # merge lot_data into the data to aggregate
        parking_inventory_df = parking_inventory_df.merge(tax_data.lot_association[[config_db.db_column_lot_id,config_db.db_column_tax_id]],how='left',on=config_db.db_column_tax_id)
        land_use_id_joins:pd.DataFrame = tax_data.lot_association[[config_db.db_column_lot_id,config_db.db_column_tax_id]].merge(tax_data.tax_table[[config_db.db_column_tax_id,config_db.db_column_tax_land_use]],on=config_db.db_column_tax_id,how='left')
        land_use_id_joins_agg = land_use_id_joins.groupby([config_db.db_column_lot_id])[config_db.db_column_tax_land_use].unique().apply(lambda x: ','.join(map(str, x))).reset_index()
        if parking_subset[config_db.db_column_parking_regs_id].values[0]=='1182':
            logger.debug('Debugging rule 1182 before any subset operations')
        match operation:
            case 1:
                # simple addition, run through the lines and add to the total
                if len(parking_subset)>1:
                    for inx,subset_reg in parking_subset.iterrows(): # iterate through lines of subset
                        # find the column you need to get from tax data in order 
                        column_in_tax_data: str = parking_reg.units_table.loc[parking_reg.units_table[config_db.db_column_units_id]==subset_reg[config_db.db_column_parking_unit_id],config_db.db_column_tax_data_column_to_multiply] 
                    
                        parking_inventory_df['column_to_use'] = column_in_tax_data # bump the column to use to whold frame
                        parking_inventory_df['unconverted_value'] = tax_data.tax_table[column_in_tax_data].copy() # copy the column to use
                        conversion_zero_crossing = parking_reg.units_table[config_db.db_column_tax_data_conversion_zero].values[0]
                        conversion_slope = parking_reg.units_table[config_db.db_column_tax_data_conversion_slope].values[0]
                        parking_inventory_df['converted_assessement_column'] = conversion_zero_crossing+parking_inventory_df['unconverted_value'] * conversion_slope # infer converted value
                        # calculate the parking
                        # get the slopes for the linear estimate
                        zero_crossing_min = subset_reg[config_db.db_column_parking_zero_crossing_min]
                        zero_crossing_max = subset_reg[config_db.db_column_parking_zero_crossing_max]
                        slope_min = subset_reg[config_db.db_column_parking_slope_min]
                        slope_max = subset_reg[config_db.db_column_parking_slope_max]
                        if subset_reg[config_db.db_column_parking_regs_id]=='1182':
                            logger.debug('Debugging rule 1182 for multiline sum')
                        if inx==0:
                            # infer min/max parking capacity
                            parking_inventory_df['n_places_min'] = zero_crossing_min + slope_min* parking_inventory_df['converted_assessement_column'] 
                            if (zero_crossing_max is not None or not np.isnan(zero_crossing_max)) and (slope_max is not None or not np.isnan(slope_max)):
                                parking_inventory_df['n_places_max'] = zero_crossing_max + slope_max * parking_inventory_df['converted_assessement_column']
                            else:
                                parking_inventory_df['n_places_max'] = np.nan
                        else:
                            # infer min/max
                            #  parking capacity
                            parking_inventory_df['n_places_min'] = parking_inventory_df['n_places_min'] + zero_crossing_min + slope_min * parking_inventory_df['converted_assessement_column'] 
                            if subset_reg[config_db.db_column_parking_regs_id]=='1182':
                                logger.debug('Debugging rule 1182 during summing operation for multiline  sum')
                            if (zero_crossing_max is not None and isinstance(zero_crossing_max,float) and not np.isnan(zero_crossing_max)) and (slope_max is not None and isinstance(slope_max,float) and not np.isnan(slope_max)):
                                parking_inventory_df['n_places_max'] = parking_inventory_df['n_places_max'] + zero_crossing_max + slope_max * parking_inventory_df['converted_assessement_column'] 
                            else:
                                parking_inventory_df['n_places_max'] = np.nan      
                else:
                    # find the column you need to get from tax data in order 
                    column_in_tax_data: str = parking_reg.units_table.loc[parking_reg.units_table[config_db.db_column_units_id]==parking_subset[config_db.db_column_parking_unit_id].iloc[0],config_db.db_column_tax_data_column_to_multiply].iloc[0]
                    parking_inventory_df['column_to_use'] = column_in_tax_data # bump the column to use to whold frame
                    parking_inventory_df = parking_inventory_df.merge(tax_data.tax_table[[config_db.db_column_tax_id,column_in_tax_data]],on=config_db.db_column_tax_id,how='left')
                    parking_inventory_df['unconverted_value'] = parking_inventory_df[column_in_tax_data]
                    parking_inventory_df['converted_assessement_column'] = parking_reg.units_table[config_db.db_column_tax_data_conversion_zero].values[0]+parking_inventory_df['unconverted_value'] * parking_reg.units_table[config_db.db_column_tax_data_conversion_slope].values[0] # infer converted value
                    zero_crossing_min = parking_subset[config_db.db_column_parking_zero_crossing_min].values[0]
                    zero_crossing_max = parking_subset[config_db.db_column_parking_zero_crossing_max].values[0]
                    slope_min = parking_subset[config_db.db_column_parking_slope_min].values[0] 
                    slope_max = parking_subset[config_db.db_column_parking_slope_max].values[0]
                    # calculate the minimum
                    # infer min/max parking capacity
                    parking_inventory_df['n_places_min'] = zero_crossing_min + slope_min* parking_inventory_df['converted_assessement_column'] 
                    if (zero_crossing_max is not None and isinstance(zero_crossing_max,float) and not np.isnan(zero_crossing_max)) and (slope_max is not None and isinstance(slope_max,float) and not np.isnan(slope_max)):
                        parking_inventory_df['n_places_max'] = zero_crossing_max + slope_max * parking_inventory_df['converted_assessement_column']  
                    else:
                        parking_inventory_df['n_places_max'] = np.nan
                parking_inventory_df.drop(columns=['column_to_use','unconverted_value','converted_assessement_column'],inplace=True)
                parking_inventory_df_agg = parking_inventory_df.groupby(by=config_db.db_column_lot_id).agg({'n_places_min':'sum','n_places_max':'sum'},skipna=True)
                parking_inventory_df_agg.loc[parking_inventory_df_agg['n_places_max']<parking_inventory_df_agg['n_places_min'],'n_places_max']=np.nan
            case 2:
                raise AttributeError('Case 2:  Obsolete operator')
            case 3:
                raise NotImplementedError('Operation Not yet implemented OR MOST CONSTRAINING')
            case 4:
                # get unit to use
                units_in_subset = parking_subset[config_db.db_column_parking_unit_id].unique().tolist()
                # there should only be one unit type for this type of requirement (i.e. changing the linear relationship based on a threshold value)
                if len(units_in_subset) ==1:
                    lower_bounds = parking_subset[config_db.db_column_threshold_value].sort_values(ascending = False).tolist()
                    # find the column in the tax data that is relebant for the unit
                    unit_to_use = units_in_subset[0]
                    # extract the column to use in the tax_data
                    column_in_tax_data: str = parking_reg.units_table.loc[parking_reg.units_table[config_db.db_column_units_id]==unit_to_use,config_db.db_column_tax_data_column_to_multiply].values[0]
                    
                    # find column to use and propagate
                    parking_inventory_df['column_to_use'] = column_in_tax_data # bump the column to use to whold frame
                    parking_inventory_df = parking_inventory_df.merge(tax_data.tax_table[[config_db.db_column_tax_id,column_in_tax_data]],on=config_db.db_column_tax_id,how='left')
                    parking_inventory_df['unconverted_value'] = parking_inventory_df[column_in_tax_data]
                        # copy the column to use
                    parking_inventory_df['converted_assessement_column'] = parking_reg.units_table[config_db.db_column_tax_data_conversion_zero].values[0]+parking_inventory_df['unconverted_value'] * parking_reg.units_table[config_db.db_column_tax_data_conversion_slope].values[0] # infer converted value
                    # Aggregate the  converted assessement column in order to properly apply the regulatiosn for undivided coops
                    parking_inventory_df_agg = parking_inventory_df.groupby(by=config_db.db_column_lot_id).agg({'converted_assessement_column':'sum'})
                    # Iterate through lower bounds
                    for inx,lower_bound in enumerate(lower_bounds):
                        zero_crossing_min = parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_zero_crossing_min].values[0]
                        slope_min = parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_slope_min].values[0] 
                        zero_crossing_max = parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_zero_crossing_max].values[0]
                        slope_max=parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_slope_max].values[0]
                        if zero_crossing_max is None:
                            zero_crossing_max = np.nan
                        if slope_max is None:
                            slope_max = np.nan
                        if zero_crossing_min is None:
                            zero_crossing_min = np.nan
                        if slope_min is None:
                            slope_min = np.nan
                        if inx==0: # if its the largest lower bound(based on sort values at line 559), then pick all tax data above threshold
                            if not np.isnan(zero_crossing_min) and not np.isnan(slope_min):
                                parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'n_places_min'] = zero_crossing_min+slope_min* parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'converted_assessement_column']
                            elif not np.isnan(zero_crossing_min) and np.isnan(slope_min):
                                parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'n_places_min'] = zero_crossing_min
                            else:
                                parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'n_places_min'] = np.nan
                            if not np.isnan(zero_crossing_max) and not np.isnan(slope_max):
                                parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'n_places_max'] = zero_crossing_max+ slope_max* parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'converted_assessement_column']
                            elif not np.isnan(zero_crossing_max) and np.isnan(slope_max):
                                parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'n_places_max'] = zero_crossing_max
                            else:
                                parking_inventory_df_agg.loc[parking_inventory_df_agg['converted_assessement_column']>=lower_bound,'n_places_max'] = np.nan
                            previous_lower_bound = lower_bound
                        else: # otherwise pick 
                            if not np.isnan(zero_crossing_min) and not np.isnan(slope_min):
                                parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df_agg['converted_assessement_column']<previous_lower_bound),'n_places_min'] = zero_crossing_min + slope_min * parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df_agg['converted_assessement_column']<previous_lower_bound),'converted_assessement_column']
                            elif not np.isnan(zero_crossing_min) and np.isnan(slope_min):
                                parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df_agg['converted_assessement_column']<previous_lower_bound),'n_places_min'] = zero_crossing_min
                            else:
                                parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df_agg['converted_assessement_column']<previous_lower_bound),'n_places_min'] = np.nan
                            if not np.isnan(zero_crossing_max) and not np.isnan(slope_max):
                                parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df_agg['converted_assessement_column']<previous_lower_bound),'n_places_max'] = zero_crossing_max+slope_max* parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df_agg['converted_assessement_column']<previous_lower_bound)]
                            elif not np.isnan(zero_crossing_max) and np.isnan(slope_max):
                                parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'n_places_max'] = zero_crossing_max
                            else:
                                parking_inventory_df_agg.loc[(parking_inventory_df_agg['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'n_places_max'] = np.nan
                            previous_lower_bound = lower_bound
                    parking_inventory_df_agg = parking_inventory_df_agg.drop(columns=['converted_assessement_column'])
                else:
                    raise NotImplementedError(f'Issue assessing subset: {subset} of rule{parking_reg.reg_head[config_db.db_column_parking_regs_id]}. Too many units in subset cannot operate threshold type condition')
            case 5:
                raise AttributeError('Case 5: Obsolete operator for rule')
            case 6:
                raise NotImplementedError('Operation Not yet implemented SIMPLE OR')
        
        #parking_inventory_df_agg[config_db.db_column_parking_subset_id] = subset
        parking_inventory_df_agg[config_db.db_column_reg_sets_id] = str(rule_set_id)
        parking_inventory_df_agg[config_db.db_column_parking_regs_id] = str(parking_reg.reg_head[config_db.db_column_parking_regs_id].values[0])
        parking_inventory_df_agg['commentaire']='Création automatique réglementaire'
        parking_inventory_df_agg['methode_estime']=2
        parking_inventory_df_agg = parking_inventory_df_agg.merge(land_use_id_joins_agg,on=config_db.db_column_lot_id,how='left')
        #parking_inventory_df_agg.reset_index(inplace=True)
        parking_inventory_df_agg.rename(inplace=True,columns={config_db.db_column_tax_land_use:config_db.db_column_land_use_id })
        if parking_subset[config_db.db_column_parking_regs_id].values[0]=='1182':
            logger.debug('Debugging rule 1182 - exit point')
        parking_inventory_object = ParkingInventory(parking_inventory_df_agg)
        return parking_inventory_object
    else:
        raise AttributeError('Too many operators in regulation subset_feature not yet implementated')

def check_neighborhood_inventory()->bool:
    NotImplementedError('Not Yet implemented')

def calculate_inventory_from_manual_entry(donnees_calcul:pd.DataFrame)->ParkingInventory:
    
    ids_reglements_obtenir:list[int] = donnees_calcul[config_db.db_column_parking_regs_id].unique().tolist()
    reglements:PR.ParkingRegulations = PR.from_postgis(ids_reglements_obtenir)
    parking_out= []
    for id_reglement in ids_reglements_obtenir:
        donnees_pertinentes:pd.DataFrame = donnees_calcul.loc[donnees_calcul[config_db.db_column_parking_regs_id]==id_reglement]
        reglement:PR.ParkingRegulations = reglements.get_reg_by_id(id_reglement)
        unites = reglement.get_units()
        unites_donnees:list[int] = donnees_pertinentes.loc[donnees_pertinentes[config_db.db_column_parking_regs_id]==id_reglement,config_db.db_column_parking_unit_id].unique().tolist()
        if unites==unites_donnees:
            parking_last = calculate_parking_specific_reg_manual_entry(reglement,donnees_pertinentes)
            parking_out.append(parking_last)
    parking_final = dissolve_list(parking_out)
    return parking_final

def calculate_parking_specific_reg_manual_entry(reg_to_calculate:PR.ParkingRegulations,provided_inputs:PII.ParkingCalculationInputs)->ParkingInventory:
    print('Not yet implemented')
    parking_frame = pd.DataFrame({'g_no_lot':[''],'n_places_min':[0],'n_places_max':[0],'n_places_mesure':[0],'n_places_estime':[0],'methode_estime':[3],'id_er':[0],'id_reg_stat':[0],'commentaire':['Fonction non implem - vide'],'cubf':[0]})
    output = ParkingInventory(parking_frame)
    if reg_to_calculate.check_only_one_regulation():
        subsets = reg_to_calculate.get_subset_numbers()
        relevant_data = provided_inputs.get_by_reg(reg_to_calculate.get_reg_id())
        for inx,subset in enumerate(subsets):
            parking_inventory_subset:ParkingInventory = calculate_parking_subset_manual(reg_to_calculate,subset,relevant_data)
            if inx ==0:
                parking_out:ParkingInventory = parking_inventory_subset
            else:
                parking_out =subset_operation(parking_out,reg_to_calculate.get_subset_inter_operation_type(subset),parking_inventory_subset)
    return parking_out

def calculate_parking_subset_manual(reg_to_calculate:PR.ParkingRegulations,subset:int,relevant_inputs:PII.ParkingCalculationInputs)->ParkingInventory:
    if reg_to_calculate.check_only_one_regulation():
        match reg_to_calculate.get_subset_intra_operation_type(subset):
            case 1:
                inventory = calculate_addition_based_subset(reg_to_calculate,subset,relevant_inputs)
                #NotImplementedError('Not yet Implemented')
            case 2:
                AttributeError('Operation 2  deprecated and no longer in use. Use operator 4 instead')
            case 3:
                AttributeError('Operation 3 not supported within one subset')
            case 4:
                inventory = calculate_threshold_based_subset(reg_to_calculate,subset,relevant_inputs)
            case 5:
                AttributeError('Operation 5 not supported within one subset')
            case 6:
                AttributeError('Operation 6 not supported within one subset')
        return inventory
    else:
        ValueError('Can only calculate one rule at a time')

def calculate_threshold_based_subset(reg_to_calculate:PR.ParkingRegulations,subset:int,data:PII.ParkingCalculationInputs):
    if reg_to_calculate.check_subset_exists(subset) and reg_to_calculate.check_only_one_regulation():
        units = reg_to_calculate.get_subset_units(subset)
        operator = reg_to_calculate.get_subset_intra_operation_type(subset)
        if len(units)==1 and operator ==4:
            thresholds = reg_to_calculate.get_subset_thresholds(subset)
            previous_threshold = None
            parking_final = pd.DataFrame()
            for threshold in thresholds:
                lower_thresh = float(threshold)
                if previous_threshold is not None:
                    upper_thresh = float(previous_threshold)
                else:
                    upper_thresh = previous_threshold
                relevant_data = data.get_by_reg(reg_to_calculate.get_reg_id()).get_by_units(units[0]).filter_by_threshold(lower_thresh, upper_thresh)
                line_def = reg_to_calculate.get_line_item_by_subset_threshold(subset,threshold)
                parking_frame_thresh = pd.DataFrame()
                parking_frame_thresh[config_db.db_column_lot_id] = relevant_data[config_db.db_column_lot_id]
                parking_frame_thresh['n_places_min'] = line_def[config_db.db_column_parking_zero_crossing_min] + line_def[config_db.db_column_parking_slope_min] * relevant_data['valeur']
                parking_frame_thresh['n_places_max'] = line_def[config_db.db_column_parking_zero_crossing_max] + line_def[config_db.db_column_parking_slope_max] * relevant_data['valeur']
                parking_frame_thresh['n_places_mesure'] = None
                parking_frame_thresh['n_places_estime'] = None
                parking_frame_thresh['methode_estime'] = 3
                parking_frame_thresh[config_db.db_column_parking_regs_id] = relevant_data[config_db.db_column_parking_regs_id]
                parking_frame_thresh[config_db.db_column_reg_sets_id] = relevant_data[config_db.db_column_reg_sets_id]
                parking_frame_thresh[config_db.db_column_land_use_id] = relevant_data[config_db.db_column_land_use_id]
                parking_frame_thresh['commentaire'] = relevant_data.apply(lambda x: f'Calc. reg. man. : valeur {x['valeur']}')
                if parking_final.empty:
                    parking_final = parking_frame_thresh
                else:
                    parking_final = pd.concat([parking_final,parking_frame_thresh])
            parking_out = ParkingInventory(parking_final)
            return parking_out
        else:
            ValueError('subset should have operator 4 and only one unit') 
    else:
        ValueError('Can only calculate one rule at a time')

def calculate_addition_based_subset(reg_to_calculate:PR.ParkingRegulations,subset:int,data:PII.ParkingCalculationInputs):
    if reg_to_calculate.check_subset_exists(subset) and reg_to_calculate.check_only_one_regulation():
        operator = reg_to_calculate.get_subset_intra_operation_type(subset)
        if operator==1:
            subset_def = reg_to_calculate.get_subset_def(subset)
            relevant_data = data.get_by_reg(reg_to_calculate.get_reg_id())
            reg_units = reg_to_calculate.get_subset_units(subset)

            if relevant_data.check_units_present(reg_units):
                inventory = pd.DataFrame(relevant_data.loc[relevant_data[config_db.db_column_parking_unit_id].isin(reg_units)].merge(subset_def,on=[config_db.db_column_parking_regs_id,config_db.db_column_parking_unit_id],how='left'))
                
                # Create a mask for rows where both conditions are not None
                mask_both_min_not_none = (
                    inventory[config_db.db_column_parking_zero_crossing_min].notna() & 
                    inventory[config_db.db_column_parking_slope_min].notna()
                )
                mask_both_max_not_note = (
                    inventory[config_db.db_column_parking_zero_crossing_max].notna() & 
                    inventory[config_db.db_column_parking_slope_max].notna()
                )
                # Create a mask for rows where both conditions are not None
                mask_crossing_min_not_none = (
                    inventory[config_db.db_column_parking_zero_crossing_min].notna()& 
                    inventory[config_db.db_column_parking_slope_min].isna()
                )
                mask_crossing_max_not_none = (
                    inventory[config_db.db_column_parking_zero_crossing_max].notna()& 
                    inventory[config_db.db_column_parking_slope_max].isna()
                )

                mask_both_min_none = (
                    inventory[config_db.db_column_parking_zero_crossing_min].isna()& 
                    inventory[config_db.db_column_parking_slope_min].isna()
                )
                mask_both_max_none = (
                    inventory[config_db.db_column_parking_zero_crossing_max].isna()& 
                    inventory[config_db.db_column_parking_slope_max].isna()
                )

                inventory.loc[mask_both_min_not_none,'n_places_min'] = inventory.loc[mask_both_min_not_none,
                        config_db.db_column_parking_zero_crossing_min] + inventory.loc[mask_both_min_not_none,
                            config_db.db_column_parking_slope_min] * inventory.loc[mask_both_min_not_none,'valeur']
                inventory.loc[mask_crossing_min_not_none,'n_places_min'] = inventory.loc[mask_crossing_min_not_none,config_db.db_column_parking_zero_crossing_min]
                inventory.loc[mask_both_min_none,'n_places_min'] = np.nan

                inventory.loc[mask_both_max_not_note,'n_places_max'] = inventory.loc[mask_both_max_not_note,
                        config_db.db_column_parking_zero_crossing_max] + inventory.loc[mask_both_max_not_note,
                            config_db.db_column_parking_slope_max] * inventory.loc[mask_both_max_not_note,'valeur']
                inventory.loc[mask_crossing_max_not_none,'n_places_max'] = inventory.loc[mask_crossing_max_not_none,config_db.db_column_parking_zero_crossing_max]
                inventory.loc[mask_both_max_none,'n_places_max'] = np.nan
                inventory.drop(columns=['id_reg_stat_emp','ss_ensemble','seuil','oper','cases_fix_min','cases_fix_max','pente_min','pente_max'],inplace=True)
                inventory['commentaire'] = inventory.apply(lambda x: f'Unite: {x['unite']}Val Man: {x['valeur']}', axis=1)
                agg_dict = {
                    config_db.db_column_land_use_id: lambda x: ', '.join(map(str, x)),
                    config_db.db_column_parking_regs_id: lambda x: ', '.join(map(str, x)),
                    config_db.db_column_reg_sets_id: lambda x: ', '.join(map(str, x)), 
                    'commentaire': lambda x: ', '.join(set(x)),    # Concatenate unique names
                    'n_places_min': 'sum',
                    'n_places_max':'sum'                         # Sum the values
                }
                inventory_out = inventory.groupby(by=config_db.db_column_lot_id).agg(agg_dict).reset_index()
                inventory_out['methode_estime'] = 3
                inventory_out['n_places_mesure'] = np.nan
                inventory_out['n_places_estime'] = np.nan
                return ParkingInventory(inventory_out)
            else:
                ValueError('You need to provide all relevant units for a regulation')