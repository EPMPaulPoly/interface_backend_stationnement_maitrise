import pandas as pd
import geopandas as gpd
from config import config_db
from typing import Union,Self

class ParkingCalculationInputs(pd.DataFrame):
    """Class that inherits from pandas.DataFrame then customizes it with additonal methods."""
    def __init__(self,*args,**kwargs):
        super(ParkingCalculationInputs,self).__init__(*args,**kwargs)
        if not self.check_columns():
            IndexError('Nom des colonnes incorrectes')
        

    @property
    def _constructor(self):
        """
        Creates a self object that is basically a pandas.Dataframe.
        self is a dataframe-like object inherited from pandas.DataFrame
        self behaves like a dataframe + new custom attributes and methods.
        """
        return ParkingCalculationInputs
    
    def _repr_html_(self):
        return pd.DataFrame(self)._repr_html_()

    def check_columns(self):
        if ((config_db.db_column_lot_id in self.columns) and 
            (config_db.db_column_land_use_id in self.columns) and 
            (config_db.db_column_parking_unit_id in self.columns) and
            (config_db.db_column_parking_regs_id) in self.columns and
            ('valeur' in self.columns)):
            return True
        else:
            return False
        
    def get_by_reg(self,reg_id:int)->Self:
        return self.loc[self[config_db.db_column_parking_regs_id]==reg_id]
    
    def get_by_units(self,unit_ids:Union[int,list[int]])->Self:
        if isinstance(unit_ids,int):
            return self.loc[self[config_db.db_column_parking_unit_id]==unit_ids]
        else:
            return self.loc[self[config_db.db_column_parking_unit_id] in unit_ids]
    
    def filter_by_threshold(self,lower_thresh:Union[float,None],upper_thresh:Union[float,None])->Self:
        if isinstance(lower_thresh,float) and upper_thresh is None:
            return self.loc[self['valeur']>=lower_thresh]
        elif isinstance(lower_thresh,float) and isinstance(upper_thresh,float):
            return self.loc[(self['valeur']>=lower_thresh)& (self['valeur']<upper_thresh)]
        elif lower_thresh is None and isinstance(upper_thresh,float):
            return self.loc[(self['valeur']<upper_thresh)]
        else:
            ValueError('At least one of the thresholds must be a float')
    
    def check_units_present(self,units:list[int])->bool:
        ## check that all the relevant units are present
        all_combinations = pd.MultiIndex.from_product(
            [self[config_db.db_column_lot_id].unique(), units],
            names=[config_db.db_column_lot_id, config_db.db_column_parking_unit_id]
        ).to_frame(index=False)

        # Merge with the existing relevant_data to see which combinations are present
        merged = all_combinations.merge(
            self[[config_db.db_column_lot_id, config_db.db_column_parking_unit_id]],
            on=[config_db.db_column_lot_id, config_db.db_column_parking_unit_id],
            how='left',
            indicator=True
        )

        # Filter for missing combinations
        missing_units = merged[merged['_merge'] == 'left_only'].drop('_merge', axis=1)

        # Display results
        if missing_units.empty:
            return True
        else:
            return False