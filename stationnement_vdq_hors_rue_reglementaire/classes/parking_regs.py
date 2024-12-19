import pandas as pd
import mimetypes
from stationnement_vdq_hors_rue_reglementaire.utilitaires.database_interface import retrieve_table
from functools import singledispatchmethod,singledispatch
import numpy as np
from stationnement_vdq_hors_rue_reglementaire.config import config_db
from sqlalchemy import create_engine,text
from stationnement_vdq_hors_rue_reglementaire.classes.tax_dataset import TaxDataset 
from stationnement_vdq_hors_rue_reglementaire.classes.parking_inventory import ParkingInventory

class ParkingRegulations():
    def __init__(self,reg_head:pd.DataFrame,reg_def:pd.DataFrame,units_table:pd.DataFrame)->None:
        self.reg_head = reg_head
        self.reg_def = reg_def
        self.units_table = units_table
    
    def __repr__(self)->str:
        return self.reg_head.__repr__()

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

    def calculate_minimum_parking(self,tax_data:TaxDataset,rule_set_to_transfer:int = 0)->ParkingInventory:
        '''
            # calculate_minimum_parking
            Calcule le minimum de stationnement pour un ensemble de points du rôle foncier.
        '''
        # Only compute if there's one reg. Inefficient but easy to handle at the moment
        if len(self.reg_head[config_db.db_column_parking_regs_id].unique().tolist())>1:
            IndexError('Should only have one regulation at a time')
        else:
            # number of subsets
            n_ensembles = len(self.reg_def[config_db.db_column_parking_subset_id].unique().tolist())
            if n_ensembles == 1:
                # straight assessment if only one subset in the rule
                subset_id = self.reg_def[config_db.db_column_parking_subset_id].iloc[0]
                parking_inventory = self.calculate_minimum_parking_subset(subset_id,tax_data,rule_set_to_transfer)
            else:
                # loop through subsets and manage operators between
                for iter_subset_id in self.reg_def[config_db.db_column_parking_subset_id].unique().tolist():
                    if iter_subset_id == 1: # if first subset, set as inventory to start
                        subset_inventory = self.calculate_minimum_parking_subset(iter_subset_id,tax_data,rule_set_to_transfer)
                        parking_inventory = subset_inventory
                    else:
                        operator = self.reg_def[config_db.db_column_parking_subset_id].iloc[0]
                        subset_inventory = self.calculate_minimum_parking(iter_subset_id,tax_data,rule_set_to_transfer)
                        parking_inventory =parking_inventory.subset_operation(operator=operator,inventory_2 = subset_inventory) # if subsequen subset, you need to check which operator it is for the subset and 

        
    def calculate_minimum_parking_subset(self,subset:int,tax_data:TaxDataset,rule_set_id:int)->ParkingInventory:
        '''
            # calculate_parking_minimum_subset
            calculates the parking requirements for one subset of a rule (as opposed to the entire rule)
        '''
        # get the subset that is relevant. only need definition
        parking_subset = self.reg_def.loc[self.reg_def[config_db.db_column_parking_subset_id]==subset].copy().sort_values(by=config_db.db_column_stacked_parking_id)
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
                operation = int(other_operators.iloc[0])
                print(operation)
        else:
            ValueError('Too many operators. Multiple operators not supported within subset except for first')
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
            parking_inventory_df[config_db.db_column_reg_sets_id] = rule_set_id
            parking_inventory_df[config_db.db_column_parking_regs_id] = self.reg_head[config_db.db_column_parking_regs_id].values[0]
            parking_inventory_df['n_places_min']=np.nan
            parking_inventory_df['n_places_max']=np.nan
             # do unit conversion if required (i.e. from if infering seating capacity from square footage or something like that)
            parking_inventory_df.merge(tax_data.lot_association[[config_db.db_column_tax_id,config_db.db_column_lot_id]],how='left',on=config_db.db_column_tax_id)
            
            match operation:
                case 1:
                    # simple addition, run through the lines and add to the total
                    for subset_reg in parking_subset.iterrows(): # iterate through lines of subset
                        # find the column you need to get from tax data in order 
                        column_in_tax_data: str = self.units_table.loc[self.units_table[config_db.db_column_units_id]==subset_reg[config_db.db_column_parking_unit_id],config_db.db_column_tax_data_column_to_multiply] 
                       
                        parking_inventory_df['column_to_use'] = column_in_tax_data # bump the column to use to whold frame
                        parking_inventory_df['unconverted_value'] = tax_data.tax_table[column_in_tax_data].copy() # copy the column to use
                        parking_inventory_df['converted_assessement_column'] = self.units_table[config_db.db_column_tax_data_conversion_zero].values[0]+parking_inventory_df['unconverted_value'] * self.units_table[config_db.db_column_tax_data_conversion_slope].values[0] # infer converted value
                        # calculate the minimum
                        parking_inventory_df['n_places_min'] = parking_inventory_df['n_places_min'] + subset_reg[config_db.db_column_parking_zero_crossing_min] + subset_reg[config_db.db_column_parking_slope_min] * parking_inventory_df['converted_assessement_column'] # infer min parking capacity
                        parking_inventory_df['n_places_max'] = parking_inventory_df['n_places_max'] + subset_reg[config_db.db_column_parking_zero_crossing_max] + subset_reg[config_db.db_column_parking_slope_max] * parking_inventory_df['converted_assessement_column'] # infer max parking capacity
                case 2:
                    AttributeError('Case 2:  Obsolete operator')
                case 3:
                    NotImplementedError('Operation Not yet implemented OR MOST CONSTRAINING')
                    parking_inventory_df=-1
                    return parking_inventory_df
                case 4:
                    # get unit to use
                    units_in_subset = parking_subset[config_db.db_column_parking_unit_id].unique().tolist()
                    # there should only be one unit type for this type of requirement (i.e. changing the linear relationship based on a threshold value)
                    if len(units_in_subset) ==1:
                        lower_bounds = parking_subset[config_db.db_column_threshold_value].sort_values(ascending = False).tolist()
                        # find the column in the tax data that is relebant for the unit
                        unit_to_use = units_in_subset[0]
                        # extract the column to use in the tax_data
                        column_in_tax_data: str = self.units_table.loc[self.units_table[config_db.db_column_units_id]==unit_to_use,config_db.db_column_tax_data_column_to_multiply].values[0]
                        
                        # find column to use and propagate
                        parking_inventory_df['column_to_use'] = column_in_tax_data # bump the column to use to whold frame
                        parking_inventory_df['unconverted_value'] = tax_data.tax_table[column_in_tax_data].copy() # copy the column to use
                        parking_inventory_df['converted_assessement_column'] = self.units_table[config_db.db_column_tax_data_conversion_zero].values[0]+parking_inventory_df['unconverted_value'] * self.units_table[config_db.db_column_tax_data_conversion_slope].values[0] # infer converted value
                        # Iterate through lower bounds
                        for inx,lower_bound in enumerate(lower_bounds):
                            zero_crossing_min = parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_zero_crossing_min].values[0]
                            slope_min = parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_slope_min].values[0] 
                            zero_crossing_max = parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_zero_crossing_max].values[0]
                            slope_max=parking_subset.loc[parking_subset[config_db.db_column_threshold_value]==lower_bound,config_db.db_column_parking_slope_max].values[0]
                            if inx==0: # if its the largest lower bound(based on sort values at line 153), then pick all tax data above threshold
                                if not np.isnan(zero_crossing_min) and not np.isnan(slope_min):
                                    parking_inventory_df.loc[parking_inventory_df['converted_assessement_column']>=lower_bound,'n_places_min'] = zero_crossing_min+slope_min* parking_inventory_df.loc[parking_inventory_df['converted_assessement_column']>=lower_bound,'converted_assessement_column']
                                elif not np.isnan(zero_crossing_min) and np.isnan(slope_min):
                                    parking_inventory_df.loc[parking_inventory_df['converted_assessement_column']>=lower_bound,'n_places_min'] = zero_crossing_min
                                if not np.isnan(zero_crossing_max) and not np.isnan(slope_max):
                                    parking_inventory_df.loc[parking_inventory_df['converted_assessement_column']>=lower_bound,'n_places_max'] = zero_crossing_max+ slope_max* parking_inventory_df.loc[parking_inventory_df['converted_assessement_column']>=lower_bound,'converted_assessement_column']
                                elif not np.isnan(zero_crossing_max) and np.isnan(slope_max):
                                    parking_inventory_df.loc[parking_inventory_df['converted_assessement_column']>=lower_bound,'n_places_max'] = zero_crossing_max
                                previous_lower_bound = lower_bound
                            else: # otherwise pick 
                                if not np.isnan(zero_crossing_min) and not np.isnan(slope_min):
                                    parking_inventory_df.loc[(parking_inventory_df['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'n_places_min'] = zero_crossing_min + slope_min * parking_inventory_df.loc[(parking_inventory_df['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'converted_assessement_column']
                                elif not np.isnan(zero_crossing_min) and np.isnan(slope_min):
                                    parking_inventory_df.loc[(parking_inventory_df['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'n_places_min'] = zero_crossing_min
                                
                                if not np.isnan(zero_crossing_max) and not np.isnan(slope_max):
                                    parking_inventory_df.loc[(parking_inventory_df['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'n_places_max'] = zero_crossing_max+slope_max* parking_inventory_df.loc[(parking_inventory_df['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound)]
                                elif not np.isnan(zero_crossing_max) and np.isnan(slope_max):
                                    parking_inventory_df.loc[(parking_inventory_df['converted_assessement_column']>=lower_bound) & (parking_inventory_df['converted_assessement_column']<previous_lower_bound),'n_places_max'] = zero_crossing_max
                                previous_lower_bound = lower_bound
                        
                    else:
                        NotImplementedError(f'Issue assessing subset: {subset} of rule{self.reg_head[config_db.db_column_parking_regs_id]}. Too many units in subset cannot operate threshold type condition')
                case 5:
                    AttributeError('Case 5: Obsolete operator for rule')
                case 6:
                    NotImplementedError('Operation Not yet implemented SIMPLE OR')
                    parking_inventory_df=-1
                    return parking_inventory_df
            if parking_inventory_df != -1:
                return parking_inventory_df
            else:
                return -1
        else:
            AttributeError('Too many operators in regulation subset_feature not yet implementated')
            return -1


    @singledispatchmethod
    def get_reg_by_id(self,id_to_get_):
        raise NotImplementedError("Cannot retrieve this data type")

    @get_reg_by_id.register
    def _(self,id_to_get_:int):
        data = self.reg_head.loc[id_to_get_]
        long_regs = self.reg_head.loc[id_to_get_]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out


    @get_reg_by_id.register
    def _(self,id_to_get_:np.ndarray):
        data = self.reg_head.loc[id_to_get_]
        long_regs = self.reg_head.loc[id_to_get_]
        object_out = ParkingRegulations(data,long_regs,self.units_table)
        return object_out
    
    @get_reg_by_id.register
    def _(self,id_to_get_:list):
        data = self.reg_head.loc[id_to_get_]
        long_regs = self.reg_head.loc[id_to_get_]
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

