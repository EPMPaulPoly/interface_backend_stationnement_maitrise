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

''' Class definition for municipal territory period'''

class MunicipalTerritoryPeriod():
    '''
        # MunicipalTerritory\n
          Object representing an era where geopolitical boundaries were constant for a given territory. Multiple rulesets can apply to one territory.\n
        ## Attributes:
            - territories_info: GeoDataFrame - name of city, name of sector, id periode and limits of sector
            - ruleset_match_table: DataFrame - many to many association of rulesets to territories Dataframe containint 
            - rulesets: PRS.ParkingRegulationSet which contains association of land use to given parking regulation. Regulations are represented in similar manner to what 
        ## Methods
            - __init__: instantiates the relevant object
            - __repr__: element to print
            - validate_dates: ensures rulesets do nothin silly
            - get_tax_points_data_in_territory
            - apply_parking_rules
        '''
    def __init__(self,territories_info:gpd.GeoDataFrame,ruleset_match_table:pd.DataFrame,rulesets:Union[PRS.ParkingRegulationSet,list],description:str,start_year:int,end_year:int,period_id:int):
        self.territories_table = territories_info
        self.ruleset_match_table = ruleset_match_table
        self.description = description
        self.start_year = start_year
        self.end_year = end_year
        self.period_id = period_id
        if isinstance(rulesets,list):
            for ruleset in rulesets:
                if not isinstance(ruleset,PRS.ParkingRegulationSet):
                    raise ValueError("Rulesets must be ParkingRegulationSet or list of ParkingRegulationSet")
            self.rulesets = rulesets
        elif isinstance(rulesets,PRS.ParkingRegulationSet):
            self.rulesets[0]=rulesets
    
    def __repr__(self)->str:
        if not self.end_year:
            string_for_view = f"Periode id: {self.period_id:03} - Valide: {self.start_year:04.0f}-Present - Description: {self.description}\n"
        elif not self.start_year:
            string_for_view = f"Periode id: {self.period_id:03} - Valide: Pre--{self.end_year:04.0f} - Description: {self.description}\n"
        else:
            string_for_view = f"Periode id: {self.period_id:03} - Valide: {self.start_year:04.0f}-{self.end_year:04.0f} - Description: {self.description}\n"
        cities = self.territories_table.copy().drop(columns=["geometry","ville","secteur"])
        for _,city in cities.iterrows():
            string_for_view = f"{string_for_view} \t City: {city["ville_sec"]}\n"
            relevant_rulesets = [ruleset for ruleset in self.rulesets if ruleset.ruleset_id in self.ruleset_match_table.loc[self.ruleset_match_table[config_db.db_column_territory_id]==city[config_db.db_column_territory_id],config_db.db_column_reg_sets_id].tolist()]
            for relevant_ruleset in relevant_rulesets:
                string_for_view= f"{string_for_view} \t\t {relevant_ruleset.__repr__()}"
        return string_for_view
          
    def validate_dates(self)->bool:
        ''' validate_dates ensures that the regulations do not overlap and that the rulesets cover the entirety of the span of the historical period for each territory - HAS YET TO BE FULLY COMPLETED'''
        
        territories_table_pandas = self.territories_table.drop(columns="geometry")
        validated_territories = []
        for territory in territories_table_pandas.iterrows():
            territory = territory[1]
            current_year = datetime.today().year
            if isinstance(self.start_year,int) and isinstance(self.end_year,int):
                date_period = list(range(self.start_year,self.end_year+1))
            elif self.start_year==None:
                date_period = list(range(1900,self.end_year+1))
            elif self.end_year==None:
                date_period = list(range(self.start_year,current_year+1))
            relevant_rulesets:list= self.ruleset_match_table.loc[self.ruleset_match_table[config_db.db_column_territory_id]==territory.loc[config_db.db_column_territory_id],config_db.db_column_reg_sets_id].unique().tolist()
            rulesets_to_analyse = [ruleset for ruleset in self.rulesets if ruleset.ruleset_id in relevant_rulesets]
            ids = [ruleset.ruleset_id for ruleset in rulesets_to_analyse]
            df_years = pd.DataFrame(columns=ids)
            df_years["years"] = date_period
        
            start_dates = [ruleset.start_date for ruleset in rulesets_to_analyse]
            end_dates = [ruleset.end_date for ruleset in rulesets_to_analyse]
            validated_rulesets = True
            for i,sd,ed,rs in zip(ids,start_dates,end_dates,rulesets_to_analyse):
                df_years[i]=False
                if np.isnan(sd):
                    ed = int(ed)
                    rule_period = list(range(1900,ed+1))
                    df_years.loc[df_years["years"].isin(rule_period),i]=True
                elif np.isnan(ed):
                    sd = int(sd)
                    rule_period = list(range(sd,current_year+1))
                    df_years.loc[df_years["years"].isin(rule_period),i]=True
                else:
                    try:
                        sd = int(sd)
                        ed = int(ed)
                    except:
                        pass
                    rule_period= list(range(sd,ed+1))
                    df_years.loc[df_years["years"].isin(rule_period),i]=True
                validated_rulesets  = validated_rulesets and rs.validate_dates()[0]
                print("test")
            result = df_years.drop(columns="years").sum(axis=1).max()
            if result>1:
                validated_territories.append(False)
            else:
                validated_territories.append(True)
        print(date_period)

    def get_tax_points_data_in_territory(self,option:int,sector:int = None,ruleset_to_retrieve:int = None)->TD.TaxDataset:
        '''# get_tax_points_in_territory_and_time\n
          gets all the tax database poitns whose construction years are in the perimiter of the limits of the sector given
            ## Inputs:
                - option 
                    - 0: get all tax poitns in period based on self.start_date and self.end_date
                    - 1: get all the tax points in a given subsector need to specify a subsector_id. get points based on geometry and start_date and end_date
                    - 2: get all the taxpoints in a given subsector based on geometry of rule set and based on start date and end date of ruleset 
                - subsector: id_periode_geo to specify a given sector in a given era
                - ruleset: to update pionts only given on a ruleset
            ## Ouputs:
                - tax_data_set.TaxDataset
        ##'''
        match option:
            case 0:
                # get option base on period
                print("option 0 - getting all points in period")
                sectors = self.territories_table[config_db.db_column_territory_id].unique().tolist()
                if self.start_year:
                    start_year= self.start_year
                else:
                    start_year = 1500
                if self.end_year:
                    end_year = self.end_year
                else:
                    end_year=datetime.today().year +1
                tax_set_to_out:TD.TaxDataset = TD.tax_database_points_from_date_territory(id_territory=sectors,start_year=start_year,end_year=end_year)    
            case 1:
                # get option based on period and subsector
                print("option 1 - get poitns that are in a subsector in given period")
                if option !=None:
                    if self.start_year:
                        start_year= self.start_year
                    else:
                        start_year = 1500
                    if self.end_year:
                        end_year = self.end_year
                    else:
                        end_year=datetime.today().year +1
                    tax_set_to_out:TD.TaxDataset = TD.tax_database_points_from_date_territory(id_territory=sector,start_year=start_year,end_year=end_year)
            case 2: 
                # get option based on period, sector 
                print("option 2 - - get poitns that are in a subsector in given period and are subject to given ruleset")
                ruleset_to_use:PRS.ParkingRegulationSet = list(filter(lambda x: x.ruleset_id == ruleset_to_retrieve, self.rulesets))[0]
                if option !=None:
                    if ruleset_to_use.start_date:
                        start_year= int(ruleset_to_use.start_date)
                    else:
                        start_year = int(1500)
                    if ruleset_to_use.end_date:
                        end_year = int(ruleset_to_use.end_date)
                    else:
                        end_year=int(datetime.today().year +1)
                    tax_set_to_out:TD.TaxDataset = TD.tax_database_points_from_date_territory(id_territory=sector,start_year=start_year,end_year=end_year)
        return tax_set_to_out

    def apply_parking_rules(self,option,sector:int=None,ruleset:int=None):

        print("test")

def get_territories_from_postgis(period:Union[int,list])->list[MunicipalTerritoryPeriod]:
    '''# get_territories_from_postgis \n
        fonction qui tire les informations de la base de données pour représenter les territoires et leur règlementation. 
        ## Inputs
            - period: int ou list d\'int représentant les périodes
        ## Outputs
            - liste de MunicipalTerritoryPeriod. un élément de liste pour chaque periode
    '''
    engine = create_engine(config_db.pg_string)
    with engine.connect() as con:
        if isinstance(period,list):
            list_of_periods_to_string = ",".join(map(str,period))
        else:
            list_of_periods_to_string = str(period)
        command = f"SELECT * FROM public.{config_db.db_table_history} WHERE {config_db.db_column_history_id} IN ({list_of_periods_to_string})"
        geopolitical_history = pd.read_sql(command,con=con)
        command = f"SELECT * FROM public.{config_db.db_table_territory} WHERE {config_db.db_column_history_id} IN ({list_of_periods_to_string})"
        territories = gpd.read_postgis(command,con=con,geom_col="geometry")
        list_of_territories_to_string = ",".join(territories[config_db.db_column_territory_id].astype(str).to_list())
        command = f"SELECT * FROM public.{config_db.db_table_match_regsets_territory} WHERE {config_db.db_column_territory_id} IN ({list_of_territories_to_string})"
        ruleset_associations = pd.read_sql(command,con=con)
        rulesets_to_retrieve = ruleset_associations[config_db.db_column_reg_sets_id].unique().tolist()
        rulesets = PRS.from_sql(rulesets_to_retrieve,con)
    list_to_return = []
    if isinstance(period,int):
        mtp_to_return = MunicipalTerritoryPeriod(
            territories,
            ruleset_associations,
            rulesets,
            geopolitical_history["nom_periode"].values[0],
            geopolitical_history["date_debut_periode"].values[0],
            geopolitical_history["date_fin_periode"].values[0],
            geopolitical_history[config_db.db_column_history_id].values[0])
        list_to_return.append(mtp_to_return)
    elif isinstance(period,list):
        for period_of_interest in period:
            territories_to_append:gpd.GeoDataFrame = territories.loc[territories[config_db.db_column_history_id]==period_of_interest]
            relevant_territories_list:list = territories_to_append[config_db.db_column_territory_id].unique().tolist()
            relevant_rulesets_list:list =  ruleset_associations.loc[ruleset_associations[config_db.db_column_territory_id].isin(relevant_territories_list),config_db.db_column_reg_sets_id].unique().tolist()
            relevant_rulesets:list[PRS.ParkingRegulationSet] = [ruleset for ruleset in rulesets if ruleset.ruleset_id in relevant_rulesets_list]
            relevant_assocations:pd.DataFrame = ruleset_associations.loc[ruleset_associations[config_db.db_column_territory_id].isin(relevant_territories_list)]
            mtp_to_append = MunicipalTerritoryPeriod(territories_to_append,
                                                     relevant_assocations,
                                                     relevant_rulesets,
                                                     geopolitical_history.loc[geopolitical_history[config_db.db_column_history_id]==period_of_interest,"nom_periode"].values[0],
                                                     geopolitical_history.loc[geopolitical_history[config_db.db_column_history_id]==period_of_interest,"date_debut_periode"].values[0],
                                                     geopolitical_history.loc[geopolitical_history[config_db.db_column_history_id]==period_of_interest,"date_fin_periode"].values[0],
                                                     geopolitical_history.loc[geopolitical_history[config_db.db_column_history_id]==period_of_interest,config_db.db_column_history_id].values[0])
            list_to_return.append(mtp_to_append)
    return list_to_return

'''
def get_territories_based_tax_dataset(tax_dataset:TD.TaxDataset):
    # liste des identifiants provinciaux de l'ensemble de tax consulté
    tax_ids = tax_dataset.tax_table[config_db.db_column_tax_id].unique().tolist()
    # Requête pour chercher l'historique de la ville
    command_period_headers = f'SELECT * FROM public.{config_db.db_table_history}'
    # Créé l'interface de la base de données postgis
    engine = create_engine(config_db.pg_string)
    list_rules = []
    list_tax = []
    #with pour l'ouverture
    with engine.connect() as con:
        # historique de la ville
        historique_total = pd.read_sql(command_period_headers,con=con)
        # itération aux travers des périodes. Pour chaque
        for _ , periode in historique_total.iterrows():
            # Requête pour trouver les territoires qui sont affectés par les points du rôle foncier. Séquencement en fonction des dates de périodes. Si la période de début est nulle alors on compare seulement la date de fin et inversement. Cette solution ne gère pas les entrées du rôle foncier qui n'ont pas de date de construction
            if np.isnan(periode[config_db.db_column_history_start_year]):# no start date, earliest period
                command_tax = f"WITH unioned_geometry AS (SELECT ST_Union(geometry) AS geom  FROM {config_db.db_table_tax_data_points} WHERE ({config_db.db_column_tax_id}  IN ('{"','".join(map(str,tax_ids))}')) AND ({config_db.db_column_tax_constr_year}::numeric<={periode[config_db.db_column_history_end_year]}))  SELECT territories.* FROM public.{config_db.db_table_territory} AS territories, unioned_geometry WHERE (ST_Intersects(territories.{config_db.db_geom_territory},unioned_geometry.geom)) AND ({config_db.db_column_history_id}={periode[config_db.db_column_history_id]})"
            elif np.isnan(periode[config_db.db_column_history_end_year]):# no end date latest period
                command_tax = f"WITH unioned_geometry AS (SELECT ST_Union(geometry) AS geom  FROM {config_db.db_table_tax_data_points} WHERE ({config_db.db_column_tax_id}  IN ('{"','".join(map(str,tax_ids))}')) AND ({config_db.db_column_tax_constr_year}::numeric>={periode[config_db.db_column_history_start_year]}))  SELECT territories.* FROM public.{config_db.db_table_territory} AS territories, unioned_geometry WHERE (ST_Intersects(territories.{config_db.db_geom_territory},unioned_geometry.geom)) AND ({config_db.db_column_history_id}={periode[config_db.db_column_history_id]})"
            else:# everything else
                command_tax = f"WITH unioned_geometry AS (SELECT ST_Union(geometry) AS geom  FROM {config_db.db_table_tax_data_points} WHERE ({config_db.db_column_tax_id}  IN ('{"','".join(map(str,tax_ids))}')) AND ({config_db.db_column_tax_constr_year}::numeric>={periode[config_db.db_column_history_start_year]}) AND ({config_db.db_column_tax_constr_year}::numeric<={periode[config_db.db_column_history_end_year]}))  SELECT territories.* FROM public.{config_db.db_table_territory} AS territories, unioned_geometry WHERE (ST_Intersects(territories.{config_db.db_geom_territory},unioned_geometry.geom)) AND ({config_db.db_column_history_id}={periode[config_db.db_column_history_id]})"
            # va chercher les territoire qui englobent les points choisis
            territories = gpd.read_postgis(command_tax,con=engine,geom_col=config_db.db_geom_territory)
            # créé une liste des identifiants de territoire
            territories_list = territories[config_db.db_column_territory_id].unique().tolist()
            # va chercher les ensembles de règlements associés au territoire
            command_rulesets = f"SELECT * FROM public.{config_db.db_table_match_regsets_territory} WHERE {config_db.db_column_territory_id} IN ('{"','".join(map(str,territories_list))}')"
            ruleset_association_data:pd.DataFrame = pd.read_sql(command_rulesets,con=con)
            for territory in territories_list:
                relevant_rulesets = ruleset_association_data.loc[ruleset_association_data[config_db.db_column_territory_id]==territory,config_db.db_column_reg_sets_id].unique().tolist()
                for rule_set in relevant_rulesets:
                    command_ruleset_header = f'SELECT * FROM public.{config_db.db_table_reg_sets_header} WHERE {config_db.db_column_reg_sets_id}={rule_set}'
                    ruleset_header = pd.read_sql(command_ruleset_header,con=con)
                    if ruleset_header[config_db.db_column_reg_sets_start_year].values[0] is None:
                        command_tax_data_to_assess = f"SELECT * FROM public.{config_db.db_table_tax_data_points} WHERE ({config_db.db_column_tax_id} IN ('{"','".join(map(str,tax_ids))}')) AND ({config_db.db_column_tax_constr_year}::numeric<={ruleset_header[config_db.db_column_reg_sets_end_year].values[0]})"
                    elif ruleset_header[config_db.db_column_reg_sets_end_year].values[0] is None:
                        command_tax_data_to_assess = f"SELECT * FROM public.{config_db.db_table_tax_data_points} WHERE ({config_db.db_column_tax_id} IN ('{"','".join(map(str,tax_ids))}')) AND ({config_db.db_column_tax_constr_year}::numeric­­­>={ruleset_header[config_db.db_column_reg_sets_start_year].values[0]})"
                    else:
                        command_tax_data_to_assess = f"SELECT * FROM public.{config_db.db_table_tax_data_points} WHERE ({config_db.db_column_tax_id} IN ('{"','".join(map(str,tax_ids))}')) AND ({config_db.db_column_tax_constr_year}::numeric­­­>={ruleset_header[config_db.db_column_reg_sets_start_year].values[0]}) AND ({config_db.db_column_tax_constr_year}::numeric<={ruleset_header[config_db.db_column_reg_sets_end_year].values[0]})"
                    tax_data_points = gpd.read_postgis(command_tax_data_to_assess,con=engine,geom_col=config_db.db_geom_tax)
                    print(command_tax_data_to_assess)
            print(command_rulesets)
'''
if __name__=="__main__":
    
    list_of_territory_periods = get_territories_from_postgis(7)
    print(list_of_territory_periods[0])
    #print(list_of_territory_periods[0].territories_table)
    #print(list_of_territory_periods[0].rulesets)

    tax_data_to_read = list_of_territory_periods[0].get_tax_points_data_in_territory(0)
    ax1=list_of_territory_periods[0].territories_table.plot(color="orange",alpha=0.7)
    ax1 = tax_data_to_read.plot(ax=ax1)
    
    plt.show()
    #test_date_validation = list_of_territory_periods[0].validate_dates()
    #print(list_of_territory_periods)
