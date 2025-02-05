import pandas as pd
import numpy as np
import geopandas as gpd

def create_land_use_label_column(data ,data_land_use_column:str,usage_spec_path:str,usage_spec_code_column_name:str):
    usage_spec = pd.read_excel(usage_spec_path,header=1,usecols=[usage_spec_code_column_name,"DESCRIPTION"])
    usage_spec = usage_spec.rename(columns={usage_spec_code_column_name:data_land_use_column})
    data = pd.merge(data,usage_spec,how="left",on=data_land_use_column)
    short_column_name = 'DESCRIPTION-SHORT'
    data[short_column_name] =data['DESCRIPTION'].str.extract(r'^(.*?)[(]', expand=False).fillna(data['DESCRIPTION']) 
    
    nom_af_max = f'{data_land_use_column}_af_max'
    data[nom_af_max] = data[data_land_use_column]/1000
    data[nom_af_max] = data[nom_af_max].apply(np.floor)
    usage_spec = usage_spec.rename(columns={data_land_use_column:nom_af_max,"DESCRIPTION":"DESCRIPTION_MAX"})
    data = pd.merge(data,usage_spec,how="left",on=nom_af_max)
    nom_af_moy = f'{data_land_use_column}_af_mid'
    data[nom_af_moy] = data[data_land_use_column]/100
    data[nom_af_moy] = data[nom_af_moy].apply(np.floor)
    usage_spec = usage_spec.rename(columns={nom_af_max:nom_af_moy,"DESCRIPTION_MAX":"DESCRIPTION_MID"})
    data = pd.merge(data,usage_spec,how="left",on=nom_af_moy)
    nom_af_min = f'{data_land_use_column}_af_min'
    data[nom_af_min] = data[data_land_use_column]/10
    data[nom_af_min] = data[nom_af_min].apply(np.floor)
    usage_spec = usage_spec.rename(columns={nom_af_moy:nom_af_min,"DESCRIPTION_MID":"DESCRIPTION_MIN"})
    data = pd.merge(data,usage_spec,how="left",on=nom_af_min)
    short_column_name = 'DESCRIPTION-SHORT-MAX'
    data[short_column_name] =data['DESCRIPTION_MAX'].str.extract(r'^(.*?)[(]', expand=False).fillna(data['DESCRIPTION_MAX']) 
    short_column_name = 'DESCRIPTION-SHORT-MID'
    data[short_column_name] =data['DESCRIPTION_MID'].str.extract(r'^(.*?)[(]', expand=False).fillna(data['DESCRIPTION_MID']) 
    short_column_name = 'DESCRIPTION-SHORT-MIN'
    data[short_column_name] =data['DESCRIPTION_MIN'].str.extract(r'^(.*?)[(]', expand=False).fillna(data['DESCRIPTION_MIN']) 
    
    return data


def return_column_name_and_break_point(column,breakdown):
    if breakdown == "MAX":
        col_util_pred=f'{column}_af_max'
        breakpoint = 2
        desc = "DESCRIPTION-SHORT-MAX"
    elif breakdown =="MID":
        col_util_pred=f'{column}_af_mid'
        breakpoint = 20
        desc = "DESCRIPTION-SHORT-MID"
    elif breakdown =="MIN":
        col_util_pred=f'{column}_af_min'
        breakpoint = 200
        desc = "DESCRIPTION-SHORT-MIN"
    else:
        col_util_pred=column
        breakdown=2000
        desc = "DESCRIPTION-SHORT-MID"
    return col_util_pred,breakpoint,desc