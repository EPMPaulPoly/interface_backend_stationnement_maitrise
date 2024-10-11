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

class reg_set_territory():
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