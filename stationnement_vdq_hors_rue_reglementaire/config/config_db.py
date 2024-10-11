#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jul 22 2024

@author: paul charbonneau
"""

# ce fichier contient l'ensemble des variables de connexion a la base de donnees pg
# la version de la base de donnees est 

#variables a modifier:
pg_host = 'localhost' #defaut localhost
pg_port = '5432' #defaut 5432
pg_dbname = 'parking_regs_test'# specifique a l'application
pg_username = 'postgres' # defaut postgres
pg_password = 'admin' # specifique a l'application
pg_schemaname = 'public' #defaut public
pg_bin_path = '/Applications/Postgres.app/Contents/Versions/13/bin/' # specifique a l'application
pg_srid = '32187' #defaut 32188
#variables derivees
pg_string = 'postgresql://' + pg_username + ':'  + pg_password + '@'  + pg_host + ':'  + pg_port + '/'  + pg_dbname

# structure de base de données
# tables
db_table_tax_data_points='role_foncier'
db_table_match_tax_lots='association_cadastre_role'
db_table_lots='cadastre'
db_table_territory='cartographie_secteurs'
db_table_history='historique_geopol'
db_table_parking_reg_headers = 'entete_reg_stationnement'
db_table_parking_reg_stacked = 'reg_stationnement_empile'
db_table_units="multiplicateur_facteurs_colonnes"
db_table_reg_sets_header = "ensembles_reglements_stat"
db_table_reg_sets_match = "association_er_reg_stat"
db_table_land_use = "cubf"
db_table_match_regsets_territory = 'association_er_territoire'
db_table_analysis_territory = 'sec_analyse'
# colonnes
# role foncier
db_column_tax_id = 'id_provinc'
db_column_tax_constr_year = 'rl0307a'
# cadastre
db_column_lot_id = 'g_no_lot'
# cartographie_secteurs
db_column_territory_id = 'id_periode_geo'
# historique
db_column_history_id = "id_periode"
db_column_history_start_year = 'date_debut_periode'
db_column_history_end_year = 'date_fin_periode'
# règlementation stationnement
db_column_parking_regs_id = 'id_reg_stat'
# unite stationnement
db_column_units_id = 'id_unite'
# ensembles de règlements
db_column_reg_sets_id = 'id_er'
db_column_reg_sets_start_year = 'date_debut_er'
db_column_reg_sets_end_year = 'date_fin_er'
# utilsiation du territoire
db_column_land_use_id = 'cubf'
#territoire d'analyse
db_column_analysis_territory_id = 'ID'
db_column_analysis_territory_name = 'NOM'

# colonnes de géométrie
db_geom_analysis ='geometry'
db_geom_tax = 'geometry'
db_geom_lots = 'geometry'
db_geom_territory = 'geometry'