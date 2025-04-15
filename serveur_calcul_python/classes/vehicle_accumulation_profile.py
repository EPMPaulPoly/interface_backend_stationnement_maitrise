import pandas as pd
import geopandas as gpd
from shapely.geometry import Point,Polygon,LineString
from shapely import Geometry,wkb
from typing import Self
import os
#import dotenv
from psycopg2 import connect
import sqlalchemy
import math
import matplotlib.pyplot as plt
import config.config_db as cf_db

class VehicleAccumulationProfile():

    def __init__(self,od_data:gpd.GeoDataFrame,sector_geom:gpd.GeoDataFrame):
        if len(sector_geom)>1:
            ValueError('sector must only have one item')
        if od_data.empty:
            ValueError('cannot initiate empty dataframe')
        self.sector_geometry = sector_geom
        self.geo_od:gpd.GeoDataFrame = od_data
        self.final_profile = pd.DataFrame()
    
    def calculate_resident_cars(self)->int:
        self.set_geometry_column('hh')
        data_from_sector = self.filter_by_sector_location('hh')
        household_head:VehicleAccumulationProfile = data_from_sector.household_head_return()
        household_head.geo_od['cars_times_fac'] = household_head.geo_od['nbveh'] * household_head.geo_od['facmen']
        total_cars = household_head.geo_od['cars_times_fac'].agg('sum')
        return total_cars
    
    def set_geometry_column(self,geom_to_use:str='hh'):
        if geom_to_use not in {"hh", "ori", "des"}:
            raise ValueError(f"Invalid geom option: {geom_to_use}")
        else:
            match geom_to_use:
                case 'hh':
                    self.geo_od.set_geometry(col="geom_logis",inplace=True)
                case 'ori':
                    self.geo_od.set_geometry(col="geom_ori",inplace=True)
                case 'des':
                    self.geo_od.set_geometry(col="geom_des",inplace=True)
                case _:
                    self.geo_od.set_geometry(col="geom_logis",inplace=True)

    def filter_by_sector_location(self,location_option:str = 'hh') ->Self:
        self.set_geometry_column(location_option)
        data_out:gpd.GeoDataFrame = self.geo_od.loc[self.geo_od.within(self.sector_geometry.geometry.iloc[0])]
        data_out_VAP = VehicleAccumulationProfile(od_data=pd.DataFrame(data_out),sector_geom=self.sector_geometry)
        return data_out_VAP

    def household_head_return(self)->Self:
        data_out = self.geo_od.loc[self.geo_od['tlog']==1]
        data_out_vap = VehicleAccumulationProfile(od_data=data_out,sector_geom=self.sector_geometry)
        return data_out_vap

    def filter_relevant_households_interacting_with_sector(self):
        # find people with origin, destination or housing in sector
        sector_geom_only:Geometry = self.sector_geometry['geometry'].iloc[0]
        relevant_person_list = self.geo_od.loc[
            self.geo_od.set_geometry(col="geom_logis").within(sector_geom_only) | 
            self.geo_od.set_geometry(col='geom_ori').within(sector_geom_only) | 
            self.geo_od.set_geometry(col='geom_des').within(sector_geom_only),
            'clepersonne'].unique().tolist()
        data_out = self.geo_od.loc[self.geo_od['clepersonne'].isin(relevant_person_list)]
        data_out_vap = VehicleAccumulationProfile(data_out,self.sector_geometry)
        return data_out_vap

    def get_list_of_dep_hours(self):
        data_out = self.geo_od['hredep'].unique().tolist()
        return data_out
    
    def get_population(self):
        self.set_geometry_column('hh')
        relevant_persons_head = self.geo_od.loc[self.geo_od.within(self.sector_geometry['geometry'].iloc[0]) & self.geo_od['tper']==1]
        population = relevant_persons_head['facper'].agg('sum')
        return population
    
    def generate_vehicle_accumulation_profile(self):
        sector_geometry_only = self.sector_geometry.geometry.iloc[0]
        heures_pertinentes= list(range(0,29))
        output = []
        for heure in heures_pertinentes:
            if heure==0:
                output.append(math.ceil(self.calculate_resident_cars()))
            else:
                previous_cars = output[-1]
                relevant_trips = self.get_car_trips_in_hour(heure)
                n_outgoing_trips = calculate_outgoing_trips(relevant_trips,sector_geometry_only)
                n_incoming_trips = calculate_incoming_trips(relevant_trips,sector_geometry_only)
                current_cars = math.ceil(previous_cars-n_outgoing_trips+n_incoming_trips)
                output.append(current_cars)
        final_out_dict = {'hour': heures_pertinentes,
                            'cars': output}
        final_out = pd.DataFrame(final_out_dict)
        final_out['id_quartier'] = self.sector_geometry['id_quartier'].values[0]
        self.final_profile=final_out
    
    def get_car_trips_in_hour(self,hour:int):
        data_out = self.geo_od.loc[(self.geo_od['heure']==hour) & (self.geo_od['mode1']==1)]
        return data_out
    
    def to_json(self):
        return self.final_profile.to_json(orient='records',force_ascii=False)

def calculate_outgoing_trips(car_trips_in_hour:gpd.GeoDataFrame,sector_polygon:Polygon):
    test= car_trips_in_hour.copy()
    test.drop(columns=['nolog', 'tlog', 'nbper', 'nbveh', 'xlonlog', 'ylatlog', 'sdrlog',
       'smlog', 'srlog', 'gslog', 'facmen',  'tper', 'sexe',
       'age', 'grpage', 'percond', 'occper', 'xlonocc', 'ylatocc', 'mobil',
       'facpermc',  'nodep', 'hredep',
       'hredepimp',  'hrearv', 'motif', 'motif_gr', 'mode2',
       'mode3', 'mode4', 'stat', 'coutstat', 'termstat', 'lieuori', 'xlonori',
       'ylatori', 'smori', 'xlondes', 'ylatdes'],inplace=True)
    
    test['ori_in_sector'] = test.set_geometry(col='geom_ori',crs=4326).within(sector_polygon)
    test['des_out_sector'] = ~test.set_geometry(col='geom_des',crs=4326).within(sector_polygon)
    test['is_outgoing_trip'] = test['ori_in_sector'] & test['des_out_sector']
    outgoing_trips = test.loc[test['is_outgoing_trip']]
    number_of_outgoing_trip = math.ceil(outgoing_trips['facper'].agg('sum'))
    dude = pd.DataFrame(test)
    return number_of_outgoing_trip

def calculate_incoming_trips(car_trips_in_hour:gpd.GeoDataFrame,sector_polygon:Polygon):
    test= car_trips_in_hour.copy()
    test.drop(columns=['nolog', 'tlog', 'nbper', 'nbveh', 'xlonlog', 'ylatlog', 'sdrlog',
       'smlog', 'srlog', 'gslog', 'facmen',  'tper', 'sexe',
       'age', 'grpage', 'percond', 'occper', 'xlonocc', 'ylatocc', 'mobil',
       'facpermc',  'nodep', 'hredep',
       'hredepimp',  'hrearv', 'motif', 'motif_gr', 'mode2',
       'mode3', 'mode4', 'stat', 'coutstat', 'termstat', 'lieuori', 'xlonori',
       'ylatori', 'smori', 'xlondes', 'ylatdes'],inplace=True)
    
    test['ori_out_sector'] = ~test.set_geometry(col='geom_ori',crs=4326).within(sector_polygon)
    test['des_in_sector'] = test.set_geometry(col='geom_des',crs=4326).within(sector_polygon)
    test['is_incoming_trip'] = test['ori_out_sector'] & test['des_in_sector']

    incoming_trips = test.loc[test['is_incoming_trip']]
    number_of_incoming_trip = math.ceil(incoming_trips['facper'].agg('sum'))
    dude = pd.DataFrame(test)
    return number_of_incoming_trip

def create_geometry_columns(raw_od)->gpd.GeoDataFrame:
    hh_lat_column_name = 'ylatlog'
    hh_long_column_name = 'xlonlog'
    hh_geometry_column_name = "geom_logis"
    ori_lat_column_name = 'ylatori'
    ori_long_column_name = 'xlonori'
    ori_geometry_column_name = "geom_ori"
    des_lat_column_name = 'ylatdes'
    des_long_column_name = 'xlondes'
    des_geometry_column_name = "geom_des"

    raw_od[hh_geometry_column_name] = [Point(xy) for xy in zip(raw_od[hh_long_column_name], raw_od[hh_lat_column_name])]
    raw_od[ori_geometry_column_name] = [Point(xy) for xy in zip(raw_od[ori_long_column_name], raw_od[ori_lat_column_name])]
    raw_od[des_geometry_column_name] = [Point(xy) for xy in zip(raw_od[des_long_column_name], raw_od[des_lat_column_name])]
    raw_od['trip_line'] = raw_od.apply(lambda row: LineString([row['geom_ori'], row['geom_des']]), axis=1)
    # Create the GeoDataFrame
    gdf = gpd.GeoDataFrame(raw_od, geometry=hh_geometry_column_name,crs=4326)
    return gdf

def get_data_for_sector_from_database(quartier:int,engine:sqlalchemy.Engine)->VehicleAccumulationProfile:
    query = f'''WITH quartier AS (
                    SELECT
                        id_quartier,
                        geometry
                    FROM
                        public.sec_analyse
                    WHERE
                        id_quartier = {quartier}
                ),
                matching_nologs AS (
                    SELECT DISTINCT odd.nolog
                    FROM 
                        od_data AS odd,
                        quartier
                    WHERE
                        ST_Intersects(odd.geom_logis, quartier.geometry) OR 
                        ST_Intersects(odd.geom_ori, quartier.geometry) OR 
                        ST_Intersects(odd.geom_des, quartier.geometry)
                )
                SELECT 
                    odd.*
                FROM 
                    od_data AS odd
                JOIN 
                    matching_nologs USING (nolog);'''
    query_territory = f'''SELECT
                        id_quartier,
                        geometry
                    FROM
                        public.sec_analyse
                    WHERE
                        id_quartier = {quartier}'''
    with engine.connect() as conn:
        data_od_survey = gpd.read_postgis(query,geom_col='geom_logis',con=conn)
        data_territory = gpd.read_postgis(query_territory,geom_col='geometry',con=conn)
    # Convert the other geometry columns from WKB (they are not automatically parsed)
    other_geom_cols = ['geom_ori', 'geom_des', 'trip_line']

    for col in other_geom_cols:
        if data_od_survey[col].dtype == object:
            data_od_survey[col] = data_od_survey[col].apply(lambda x: wkb.loads(x, hex=True) if isinstance(x, (str, bytes)) else None)
    vap_to_return = VehicleAccumulationProfile(data_od_survey,data_territory)
    return vap_to_return
    

def calculate_VAP_from_database_data(quartier:int,con:sqlalchemy.Engine)->Self:
    vap_to_calculate:VehicleAccumulationProfile = get_data_for_sector_from_database(quartier,con)
    vap_to_calculate.generate_vehicle_accumulation_profile()
    return vap_to_calculate


if __name__=="__main__":
    path_od = r'C:\Users\paulc\Documents\01-Poly Msc\Recherche\DonneesOD\od17_extrait_2025049.csv'
    raw_od = pd.read_csv(path_od)
    engine = sqlalchemy.create_engine(cf_db.pg_string)
    query = 'SELECT * FROM public.sec_analyse WHERE id_quartier =1'
    with engine.connect() as con:
        sector = gpd.read_postgis(query,geom_col='geometry',crs=4326,con=con)
    vap_test = VehicleAccumulationProfile(raw_od,sector)
    print(f'Nombre de voitures du secteur: {math.ceil(vap_test.calculate_resident_cars())}')
    print(f'Population: {math.ceil(vap_test.get_population())}')
    vap_test_interactors_only = vap_test.filter_relevant_households_interacting_with_sector()
    print(vap_test_interactors_only.geo_od)
    output = vap_test_interactors_only.generate_vehicle_accumulation_profile()
    output.plot(x='hour',y='cars',kind='bar')
    plt.show()