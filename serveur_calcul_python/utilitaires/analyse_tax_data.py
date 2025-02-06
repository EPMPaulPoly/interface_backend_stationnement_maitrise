import pandas as pd
import logging
import matplotlib.pyplot as plt
import numpy as np
from osgeo import gdal,ogr
import fiona as f
import geopandas as gpd
import pandas as pd
import os
from .treat_tax_data import return_column_name_and_break_point
#plt.rcParams['figure.figsize'] = [5,5]

logger = logging.getLogger(__name__)

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s - %(funcName)20s() : %(message)s')
console_handler = logging.StreamHandler()

#file_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)  # You can set the desired log level for console output
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
logger.propagate = False



def building_type_dist(tax_database_data,land_use_column,breakdown,**kwargs):
    fig_size = kwargs.get("fig_size",None)     
    col_util_pred,residential_break,desc_name = return_column_name_and_break_point(land_use_column,breakdown)
    tax_data_residential = tax_database_data[(tax_database_data[col_util_pred]<residential_break)]
    tax_data_all_other = tax_database_data[(tax_database_data[col_util_pred]>=residential_break)]
    tax_data_count_residential = tax_data_residential[desc_name].value_counts()
    tax_data_count_all_other = tax_data_all_other[desc_name].value_counts()
    if fig_size:
        plt.figure(figsize=fig_size)
    else:
        plt.figure()
    ax1=plt.subplot(1,2,1)
    tax_data_count_residential.plot(kind="bar",x=desc_name,y='count',ax=ax1)
    plt.xlabel('Affectation principale')
    plt.ylabel('Nombre d\'unités d\'évaluation')
    plt.title('Exploration du nombre d\'unités d\'évaluation résidentielles')
    ax2=plt.subplot(1,2,2)
    tax_data_count_all_other.plot(kind="bar",x=desc_name,y='count',ax=ax2)
    plt.xlabel('Affectation principale')
    plt.ylabel('Nombre d\'unités d\'évaluation')
    plt.title('Exploration du nombre d\'unités d\'évaluation autres que résidentielles')
    plt.show()




def descriptive_analysis_tax_data(
        tax_data_xml, tax_data_GIS_path, census_construction_data_path,
        col_util_pred,**kwargs):
    logger.info("Tax database start")
    is_plotted = kwargs.get("create_charts",None)

    if is_plotted:

        analyse_residential_construction_years(tax_data_xml,census_construction_data_path,col_util_pred,20)
        building_type_dist(tax_data_xml,col_util_pred,20)
    logger.info("Tax database end")


def inference_plancher_valeur(geodataframe, localisation_centre):
    print("dude")


def analyse_residential_construction_years(tax_database_data,path_to_census_data,land_use_col,breakdown,**kwargs):
    write_excel_file = kwargs.get("write_file",None)
    fig_size = kwargs.get("fig_size",None)
    
    col_util_pred,residential_break,desc_name = return_column_name_and_break_point(land_use_col,breakdown)


     # analyse des années de construction basé role foncier distribution
    dwellings_tax_database = tax_database_data.loc[(tax_database_data[col_util_pred]<residential_break)]
    
    if fig_size:
        plt.figure(figsize=fig_size)
    else:
        plt.figure()
    dwellings_tax_database["millesime_constr"].plot.hist(bins=[1600,1620,1640,1660,1680,1700,1720,1740,1760,1780,1800,1820,1840,1860,1880,1900,1920,1940,1960,1980,2000,2021],width=20)
    plt.xlabel("Année de construction")
    plt.ylabel("Nombre d'unités d'évaluation")
    # assignation à une catégorie de construction compatible avec le recensement
    dwellings_tax_database["categ_constr"] = "Non-Affecté"
    dwellings_tax_database.loc[dwellings_tax_database["millesime_constr"] < 1961,"categ_constr"] = "1960_ou_avant"
    dwellings_tax_database.loc[(dwellings_tax_database["millesime_constr"] >= 1961) &
                                (dwellings_tax_database["millesime_constr"] < 1981), "categ_constr"] = "1961-1980"
    dwellings_tax_database.loc[(dwellings_tax_database["millesime_constr"] >= 1981) &
                                (dwellings_tax_database["millesime_constr"] < 2001), "categ_constr"] = "1981-2000"
    dwellings_tax_database.loc[(dwellings_tax_database["millesime_constr"] >= 1981) &
                                (dwellings_tax_database["millesime_constr"] < 2001), "categ_constr"] = "1981-2000"
    dwellings_tax_database.loc[(dwellings_tax_database["millesime_constr"] >= 2001) &
                                (dwellings_tax_database["millesime_constr"] < 2021), "categ_constr"] = "2001-2020"
    dwellings_tax_database.loc[(dwellings_tax_database["millesime_constr"] >= 2021) , "categ_constr"] = "2021+"
    construction_summary_assessment = dwellings_tax_database.groupby(by="categ_constr").count()
    construction_summary_assessment = construction_summary_assessment["millesime_constr"]
    construction_summary_dwellings = dwellings_tax_database.groupby(by="categ_constr").n_logements.sum()

    #lecture fichier recensement et jointure avec le role foncier.
    construction_summary_dwellings_census = pd.read_csv(path_to_census_data, index_col="categ_constr")
    construction_summary_merged= pd.merge(construction_summary_dwellings,construction_summary_dwellings_census,
                                            how="left",left_index=True,right_index=True)
    construction_summary_merged_pdf = construction_summary_merged.drop(columns=["n_logements","compte_recensement"])
    # calcul d'une distribution de probabilité
    construction_summary_merged_pdf["role"] = construction_summary_merged["n_logements"]/construction_summary_merged["n_logements"].sum()
    construction_summary_merged_pdf["role"] = construction_summary_merged_pdf["role"].cumsum() * 100
    construction_summary_merged_pdf["recensement"] = construction_summary_merged["compte_recensement"] / construction_summary_merged[
        "compte_recensement"].sum()
    construction_summary_merged_pdf["recensement"] = construction_summary_merged_pdf["recensement"].cumsum() * 100
    construction_summary_for_output = pd.merge(construction_summary_merged, construction_summary_merged_pdf,
                                            how="left", left_index=True, right_index=True)
    # Écriture au fichier
    if write_excel_file:
        construction_summary_for_output.to_excel("data_out/Sommaire_construction_Québec.xlsx")
    # Création de graphique relié aux années de construction de logement et comparaison au recensement
    plt.rcParams['text.usetex'] = True
    if fig_size:
        plt.figure(figsize=fig_size)
    else:
        plt.figure()
    ax1=plt.subplot(1,2,1)
    construction_summary_assessment.plot(kind="bar",ax=ax1)
    ax1.set_xlabel(r"Année Construction")
    ax1.set_ylabel(r"Nombre d'unités d'évaluations")
    plt.ylim([0,90000])
    ax1.set_title(r"Nombres d'unités d'évaluation de type logements (RL0106A $\in$ [1000-1999]) par année de construction")
    ax2=plt.subplot(1,2,2)
    construction_summary_merged.plot(kind="bar", ax=ax2)
    #ax2.set_xlabel("Année Construction")
    ax2.set_ylabel(
        r"Nombre de logements $\sum{RL0311A}$ $\forall$ RL0106A $\in$ [1000-1999] OU colonnes du recensement v4090,4091,4092,4093,4094,4095,4096,4097")
    construction_summary_merged_pdf.plot(kind="line",ax=ax2,secondary_y=True,color=["red","green"])
    secay = plt.gca().secondary_yaxis('right')
    secay.set_ylabel('Pourcentage cumulé des logements')
    
    ax2.set_title(r"Nombres de logements par année de construction")
    ax2.legend([r"$N_{logements}$, role_foncier, CM = 23027",r"$N_{logements}$, Recensement 2021, SDR =23027",r"Pourcentage cumulé logements, Role Foncier, CM = 23027",r"Pourcentage cumulé logements, Recensement 2021, SDR =23027"])
    ax2.set_xlabel(r"Année Construction")
    # distribution des unités d'évaluation par type
    plt.show()
    plt.rcParams['text.usetex'] = False


def missing_floor_area_data_tally(tax_data,area_column,land_use_col,breakdown,**kwargs):
    fig_size = kwargs.get("fig_size",None)     
    _ , _ ,desc_name = return_column_name_and_break_point(land_use_col,breakdown)
    n_missing_areas = tax_data.loc[tax_data[area_column].isnull(),desc_name].groupby([tax_data[desc_name]]).count()
    n_tax_units = tax_data[desc_name].groupby([tax_data[desc_name]]).count()
    missing_area_perc = n_missing_areas/n_tax_units*100
    if fig_size:
        ax1=missing_area_perc.plot(kind="bar",figsize=fig_size)
    else:
        ax1=missing_area_perc.plot(kind="bar")
    ax1.set_xlabel("Utilisation du sol")
    ax1.set_ylabel("Pourcentage n'ayant pas de superficie de bâtiment allouée")
    ax1.set_ylim([0,100])
