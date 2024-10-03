import pandas as pd
import geopandas as gpd
import numpy as np
from shapely import wkt
import matplotlib.pyplot as plt
from sqlalchemy import create_engine,text
from stationnement_vdq_hors_rue_reglementaire.config import config_db
from typing import Optional, Union

class TaxDataset():
    '''# TaxDataset: \n
    contient le rôle foncier, le cadastre et la table associant les deux avec une table'''
    def __init__(self,data_table:gpd.GeoDataFrame,lot_association:pd.DataFrame,lot_data:gpd.GeoDataFrame):
        self.tax_table = data_table
        self.lot_association = lot_association
        self.lot_table = lot_data

    def plot(self,ax:plt.axis=None,arguments=None):
        ''' # plot\n 
        Permet de créer un graphe très simple de du cadastre et du rôle foncier pour pouvoir faire de la visualisation
        ## Inputs
            - Aucun
        ## Outputs
            - ax L un ax matplotlib'''
        if ax:
            ax = self.lot_table.plot(ax=ax)
            self.tax_table.plot(ax=ax,color="r")
        else:
            ax=self.lot_table.plot()
            self.tax_table.plot(ax=ax,color="r")
        return ax
    
    def explore(self,file:str="./data/tax.html",arguments=None):
        '''# explore\n
            utilise leaflet pour envoyer les données vers un fichier html
            ## Inputs
                - file: nom du fichier
        '''
        m1 = self.lot_table.explore()
        tax_table = self.tax_table.drop(columns="dat_cond_mrche")
        tax_table.explore(m=m1,color='red')
        m1.save(file)

    def __repr__(self):
        '''# __repr__ \n
         donne la représentation de l'ensemble de données. Il faudra faire un ménage parce que la jointure va prendre trop longtemps. Ce n'est pas particulièrement brillant en ce moment'''
        data = pd.merge(self.lot_table.drop(columns="geometry"),self.lot_association, on="g_no_lot")
        data = pd.merge(data,self.tax_table.drop(columns="geometry"), on="id_provinc")
        return data.__repr__()

def tax_database_points_from_date_territory(id_territory:Union[int,list[int]],start_year:int,end_year:int)->TaxDataset:
    '''# tax_database_points_from_polygon \n
        Permet de tirer les données du rôle, du cadastre et l\'association qui permet de sortir un objet TaxDataset
        ## Inputs:+
            - id_polygon: identifiant du/des secteur(s) municipal/aux pour lequel on veut aller chercher les données
            - start_year: borne inferieure de construction du bâtiment
            - end_year: borne supérieure de construction du bâtiment
        ## Output
            - TaxDataset: returns a tax_dataset'''
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        # pull tax data
        if isinstance(id_territory,int):
            command_points = f"SELECT * FROM {config_db.db_table_tax_data_points} as p WHERE ST_Within(p.geometry::geometry, (SELECT geometry FROM public.{config_db.db_table_territory} WHERE {config_db.db_column_territory_id} = {id_territory})::geometry) AND CAST({config_db.db_column_tax_constr_year} AS int) >= {start_year} AND CAST({config_db.db_column_tax_constr_year} AS int) <= {end_year};"
        elif isinstance(id_territory,list):
            command_points = f"SELECT * FROM {config_db.db_table_tax_data_points} as p WHERE ST_Within(p.geometry::geometry, (SELECT ST_Union(geometry) FROM public.{config_db.db_table_territory} WHERE {config_db.db_column_territory_id} IN ({",".join(map(str,id_territory))}))::geometry) AND CAST({config_db.db_column_tax_constr_year} AS int) >= {start_year} AND CAST({config_db.db_column_tax_constr_year} AS int) <= {end_year};"
        data = gpd.read_postgis(command_points,con=con,geom_col="geometry")
        # find the unique tax accounts and find the associated lot ids
        id_role = data[config_db.db_column_tax_id].unique().tolist()
        command_rel_assoc = f"SELECT * FROM public.{config_db.db_table_match_tax_lots} WHERE {config_db.db_column_tax_id} IN ('{"','".join(map(str,id_role))}');"
        association_table = pd.read_sql(command_rel_assoc,con=con)
        # find unique lot numbers and pull the relevant lots
        id_cadastre = association_table[config_db.db_column_lot_id].unique().tolist()
        command_lots = f"SELECT * FROM public.{config_db.db_table_lots} WHERE {config_db.db_column_lot_id} in ('{"','".join(map(str,id_cadastre))}');"
        lot_table = gpd.read_postgis(command_lots,con=con,geom_col="geometry")
    # create the tax dataset
    data_to_out = TaxDataset(data_table=data,lot_association=association_table,lot_data=lot_table)
    return data_to_out
    
def tax_database_for_analysis_territory(id_analysis_territory:int)->TaxDataset:
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        command = f'SELECT points.* FROM {config_db.db_table_tax_data_points} AS points, {config_db.db_table_analysis_territory} AS polygons WHERE ST_Within(points.{config_db.db_geom_tax}, (SELECT polygons.{config_db.db_geom_analysis} WHERE polygons."{config_db.db_column_analysis_territory_id}" = {id_analysis_territory}))'
        tax_base_data = gpd.read_postgis(command,con=engine,geom_col=config_db.db_geom_tax)
        unique_tax_ids = tax_base_data[config_db.db_column_tax_id].unique().tolist()
        command_association = f"SELECT * FROM {config_db.db_table_match_tax_lots} WHERE {config_db.db_column_tax_id} IN ('{"','".join(map(str,unique_tax_ids))}')"
        association_database = pd.read_sql(command_association,con=con)
        unique_lot_ids = association_database[config_db.db_column_lot_id].unique().tolist()
        command_lots = f"SELECT * FROM {config_db.db_table_lots} WHERE {config_db.db_column_lot_id} IN ('{"','".join(map(str,unique_lot_ids))}')"
        lot_database = gpd.read_postgis(command_lots,con=engine,geom_col=config_db.db_geom_lots)
        tax_data_set_to_return = TaxDataset(tax_base_data,association_database,lot_database)
        return tax_data_set_to_return

def from_postgis(**kwargs):
    polygon = kwargs.get("polygon",None)
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        if polygon ==None:
            command = f"SELECT * FROM public.role_foncier"
            tax_data = gpd.read_postgis(command,con,geom_col="geometry")
            command = f"SELECT * FROM public.cadastre"
            lot_data =  gpd.read_postgis(command,con,geom_col="geometry")
            command = f"SELECT * FROM public.association_cadastre_role"
            association_data = pd.read_sql(command,con)
        else:
            print("Bounding box retrival Function not implemented")
    object_out = TaxDataset(tax_data,association_data,lot_data)
    return object_out
        
if __name__=="__main__":
    #datatax=np.array([["23027258894478510000000",125,0,"POINT(0.5 0.5)"],["23027258968770010000000",181,1,"POINT(1.5 1.5)"]])
    #tax_table = gpd.GeoDataFrame(data=datatax,columns=["id_provinc","rl_0308a","rl0311a","geometry"])
    #tax_table["geometry"] = tax_table["geometry"].apply(wkt.loads)
    #tax_table = tax_table.set_geometry("geometry")
    #tax_table =tax_table.set_crs(4326)
    #datalot = np.array([["1 000 000","dude 1","POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))"],
    #                    ["1 000 001","dude 2","POLYGON((1 1, 1 2, 2 2, 2 1, 1 1))"]])
    #lot_table = gpd.GeoDataFrame(data=datalot, columns = ["g_no_lot","dude","geometry"])
    #lot_table["geometry"] = lot_table["geometry"].apply(wkt.loads)
    #lot_table = lot_table.set_geometry("geometry")
    #lot_table = lot_table.set_crs(4326)
    #assocation_table = pd.DataFrame(data=np.array([["23027258894478510000000","1 000 000"],
     #                                ["23027258968770010000000","1 000 001"]]),columns=["id_provinc","g_no_lot"])
    #tax_dataset = TaxDataset(tax_table,assocation_table,lot_table)
    #tax_dataset.plot()
    #plt.show()
    #print(tax_dataset)
    #tax_data = from_postgis()
    #print(tax_data)
    #tax_data.plot()
    #plt.show()
    tax_dataset = tax_database_points_from_date_territory([64,65],1995,1996)
    tax_dataset.plot()
    plt.show()