--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2025-06-07 23:06:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 6026 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 325 (class 1255 OID 890208)
-- Name: update_eval_inventaire_reg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_eval_inventaire_reg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Delete old entries for the lot (in case of UPDATE)
    DELETE FROM eval_inventaire_reg
    WHERE g_no_lot = NEW.g_no_lot;

    -- Insert new computed values
    INSERT INTO eval_inventaire_reg (
        g_no_lot,
        compte_role,
        compte_donnee_manquant,
        compte_date_manquant,
        n_places_min_nul
    )
    SELECT
        cad.g_no_lot,
        COUNT(rf.id_provinc) AS compte_role,
        COUNT(
            CASE 
                WHEN (rf.rl0308a IS NULL AND rf.rl0105a::int <= 1999)
                     OR (rf.rl0311a IS NULL AND rf.rl0105a::int >= 2000)
                THEN 1 
            END
        ) AS compte_donnee_manquant,
        COUNT(CASE WHEN rf.rl0307a IS NULL THEN 1 END) AS compte_date_manquant,
        (CASE WHEN inv.n_places_min = 0 THEN TRUE ELSE FALSE END) AS n_places_min_nul
    FROM role_foncier rf
    JOIN association_cadastre_role acr ON acr.id_provinc = rf.id_provinc
    JOIN cadastre cad ON acr.g_no_lot = cad.g_no_lot
    JOIN inventaire_stationnement inv ON cad.g_no_lot = inv.g_no_lot
    WHERE inv.methode_estime = 2
      AND cad.g_no_lot = NEW.g_no_lot
    GROUP BY cad.g_no_lot, inv.n_places_min;

    RETURN NULL; -- Since this is an AFTER trigger
END;
$$;


ALTER FUNCTION public.update_eval_inventaire_reg() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 17608)
-- Name: association_cadastre_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.association_cadastre_role (
    g_no_lot character varying(255),
    id_provinc character varying(255)
);


ALTER TABLE public.association_cadastre_role OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17683)
-- Name: association_er_reg_stat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.association_er_reg_stat (
    id_er integer,
    cubf integer,
    id_reg_stat integer,
    id_assoc_er_reg integer NOT NULL
);


ALTER TABLE public.association_er_reg_stat OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17686)
-- Name: association_er_reg_stat_id_assoc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.association_er_reg_stat_id_assoc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.association_er_reg_stat_id_assoc_seq OWNER TO postgres;

--
-- TOC entry 6027 (class 0 OID 0)
-- Dependencies: 229
-- Name: association_er_reg_stat_id_assoc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.association_er_reg_stat_id_assoc_seq OWNED BY public.association_er_reg_stat.id_assoc_er_reg;


--
-- TOC entry 231 (class 1259 OID 17694)
-- Name: association_er_territoire; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.association_er_territoire (
    id_asso_er_ter integer NOT NULL,
    id_er integer,
    id_periode_geo integer
);


ALTER TABLE public.association_er_territoire OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17693)
-- Name: association_er_territoire_id_association_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.association_er_territoire_id_association_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.association_er_territoire_id_association_seq OWNER TO postgres;

--
-- TOC entry 6028 (class 0 OID 0)
-- Dependencies: 230
-- Name: association_er_territoire_id_association_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.association_er_territoire_id_association_seq OWNED BY public.association_er_territoire.id_asso_er_ter;


--
-- TOC entry 250 (class 1259 OID 19713)
-- Name: association_tarifs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.association_tarifs (
    id_tarif_emp integer NOT NULL,
    id_tarif integer,
    id_periode_tarifaire integer,
    id_couts integer
);


ALTER TABLE public.association_tarifs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 19712)
-- Name: association_tarifs_id_tarif_emp_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.association_tarifs_id_tarif_emp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.association_tarifs_id_tarif_emp_seq OWNER TO postgres;

--
-- TOC entry 6029 (class 0 OID 0)
-- Dependencies: 249
-- Name: association_tarifs_id_tarif_emp_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.association_tarifs_id_tarif_emp_seq OWNED BY public.association_tarifs.id_tarif_emp;


--
-- TOC entry 242 (class 1259 OID 17908)
-- Name: cadastre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cadastre (
    level_0 integer,
    level_1 integer,
    g_objectid integer,
    g_no_lot character varying(255),
    g_co_type_ character varying(255),
    g_co_typ_1 character varying(255),
    g_co_echel character varying(255),
    g_co_ech_1 character varying(255),
    g_co_ech_2 character varying(255),
    g_nb_coord double precision,
    g_nb_coo_1 double precision,
    g_nb_angle double precision,
    g_co_indic character varying(255),
    g_va_suprf double precision,
    g_va_sup_1 double precision,
    g_co_typ_2 character varying(255),
    g_no_plan_ character varying(255),
    g_co_circm character varying(255),
    g_nm_circn character varying(255),
    g_da_depot character varying(255),
    g_no_feuil character varying(255),
    g_da_mise_ character varying(255),
    g_dh_dernr character varying(255),
    g_shape_le double precision,
    g_shape_ar double precision,
    g_dat_acqu character varying(255),
    g_dat_char character varying(255),
    g_oid integer,
    geometry public.geometry(Geometry,4326)
);


ALTER TABLE public.cadastre OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17654)
-- Name: cartographie_secteurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cartographie_secteurs (
    id_periode_geo integer NOT NULL,
    ville character varying(255),
    secteur character varying(255),
    ville_sec character varying(255),
    id_periode integer,
    geometry public.geometry(Geometry,4326)
);


ALTER TABLE public.cartographie_secteurs OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17653)
-- Name: cartographie_secteurs_id_periode_geo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cartographie_secteurs_id_periode_geo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cartographie_secteurs_id_periode_geo_seq OWNER TO postgres;

--
-- TOC entry 6030 (class 0 OID 0)
-- Dependencies: 226
-- Name: cartographie_secteurs_id_periode_geo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cartographie_secteurs_id_periode_geo_seq OWNED BY public.cartographie_secteurs.id_periode_geo;


--
-- TOC entry 259 (class 1259 OID 889960)
-- Name: census_population; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.census_population (
    "ADIDU" text,
    "IDUGD" text,
    "SUPTERRE" double precision,
    "PRIDU" text,
    geometry public.geometry(MultiPolygon,4326),
    "GEO UID" text,
    pop_2021 bigint,
    pop_2016 double precision,
    habitats_2021 bigint,
    habitats_occup_2021 bigint,
    dens_pop_par_km_2 double precision,
    superf double precision
);


ALTER TABLE public.census_population OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 890212)
-- Name: census_population_2016; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.census_population_2016 (
    "ADIDU" text,
    "PRIDU" text,
    "PRNOM" text,
    "DRIDU" text,
    "DRNOM" text,
    "DRGENRE" text,
    "SRUIDU" text,
    "SRUNOM" text,
    "SDRIDU" text,
    "SDRNOM" text,
    "SDRGENRE" text,
    "RÉIDU" text,
    "RÉNOM" text,
    "CSSCODE" text,
    "CSSGENRE" text,
    "RMRIDU" text,
    "RMRPIDU" text,
    "RMRNOM" text,
    "RMRGENRE" text,
    "SRIDU" text,
    "SRNOM" text,
    "ADAIDU" text,
    geometry public.geometry(MultiPolygon,4326),
    "GEO UID" text,
    pop_2016 bigint,
    habitats_2016 bigint,
    habitats_occup_2016 bigint,
    dens_pop_par_km_2_2016 double precision,
    superf_2016 double precision
);


ALTER TABLE public.census_population_2016 OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 19726)
-- Name: clienteles_hors_rue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clienteles_hors_rue (
    id_clientele integer,
    description_clientele character varying(255)
);


ALTER TABLE public.clienteles_hors_rue OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 19706)
-- Name: couts_tarifaires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couts_tarifaires (
    id_couts_emp integer NOT NULL,
    type_couts integer,
    seuil_temps integer,
    unite_seuil integer,
    ordonnee_origine double precision,
    pente_tarif double precision,
    unite_tarif integer,
    id_couts integer
);


ALTER TABLE public.couts_tarifaires OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 19705)
-- Name: couts_tarifaires_id_couts_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.couts_tarifaires_id_couts_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.couts_tarifaires_id_couts_seq OWNER TO postgres;

--
-- TOC entry 6031 (class 0 OID 0)
-- Dependencies: 247
-- Name: couts_tarifaires_id_couts_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.couts_tarifaires_id_couts_seq OWNED BY public.couts_tarifaires.id_couts_emp;


--
-- TOC entry 223 (class 1259 OID 17526)
-- Name: cubf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cubf (
    cubf bigint NOT NULL,
    description text
);


ALTER TABLE public.cubf OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 890172)
-- Name: donnees_foncieres_agregees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donnees_foncieres_agregees (
    id_quartier integer,
    valeur_moyenne_logement integer,
    superf_moyenne_logement integer,
    valeur_fonciere_totale bigint,
    valeur_fonciere_logement_totale bigint
);


ALTER TABLE public.donnees_foncieres_agregees OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17701)
-- Name: ensembles_reglements_stat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ensembles_reglements_stat (
    id_er integer NOT NULL,
    date_debut_er integer,
    date_fin_er integer,
    description_er character varying(255)
);


ALTER TABLE public.ensembles_reglements_stat OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17700)
-- Name: ensembles_reglements_stat_id_er_stat_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ensembles_reglements_stat_id_er_stat_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ensembles_reglements_stat_id_er_stat_seq OWNER TO postgres;

--
-- TOC entry 6032 (class 0 OID 0)
-- Dependencies: 232
-- Name: ensembles_reglements_stat_id_er_stat_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ensembles_reglements_stat_id_er_stat_seq OWNED BY public.ensembles_reglements_stat.id_er;


--
-- TOC entry 252 (class 1259 OID 19720)
-- Name: entete_couts_tarifs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entete_couts_tarifs (
    id_couts integer NOT NULL,
    description_prog_tarifaire character varying(255)
);


ALTER TABLE public.entete_couts_tarifs OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 19719)
-- Name: entete_couts_tarifs_id_couts_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entete_couts_tarifs_id_couts_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entete_couts_tarifs_id_couts_seq OWNER TO postgres;

--
-- TOC entry 6033 (class 0 OID 0)
-- Dependencies: 251
-- Name: entete_couts_tarifs_id_couts_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entete_couts_tarifs_id_couts_seq OWNED BY public.entete_couts_tarifs.id_couts;


--
-- TOC entry 235 (class 1259 OID 17717)
-- Name: entete_reg_stationnement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entete_reg_stationnement (
    id_reg_stat integer NOT NULL,
    description character varying(255),
    annee_debut_reg integer,
    annee_fin_reg integer,
    texte_loi character varying(255),
    article_loi character varying(255),
    paragraphe_loi character varying(255),
    ville character varying(255)
);


ALTER TABLE public.entete_reg_stationnement OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17716)
-- Name: entete_reg_stationnement_id_reg_stat_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entete_reg_stationnement_id_reg_stat_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entete_reg_stationnement_id_reg_stat_seq OWNER TO postgres;

--
-- TOC entry 6034 (class 0 OID 0)
-- Dependencies: 234
-- Name: entete_reg_stationnement_id_reg_stat_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entete_reg_stationnement_id_reg_stat_seq OWNED BY public.entete_reg_stationnement.id_reg_stat;


--
-- TOC entry 244 (class 1259 OID 19692)
-- Name: entete_tarifs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entete_tarifs (
    id_tarif integer NOT NULL,
    description_tarif character varying(255)
);


ALTER TABLE public.entete_tarifs OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 890203)
-- Name: eval_inventaire_reg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eval_inventaire_reg (
    g_no_lot character varying(255),
    compte_role integer,
    compte_donnee_manquante integer,
    compte_date_manquante integer,
    n_places_min_nul boolean
);


ALTER TABLE public.eval_inventaire_reg OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17483)
-- Name: historique_geopol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_geopol (
    id_periode integer NOT NULL,
    nom_periode character varying(255),
    date_debut_periode integer,
    date_fin_periode integer
);


ALTER TABLE public.historique_geopol OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17482)
-- Name: historique_geopol_id_periode_geo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_geopol_id_periode_geo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_geopol_id_periode_geo_seq OWNER TO postgres;

--
-- TOC entry 6035 (class 0 OID 0)
-- Dependencies: 221
-- Name: historique_geopol_id_periode_geo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_geopol_id_periode_geo_seq OWNED BY public.historique_geopol.id_periode;


--
-- TOC entry 256 (class 1259 OID 887999)
-- Name: inventaire_stationnement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventaire_stationnement (
    g_no_lot text,
    n_places_min double precision,
    n_places_max double precision,
    id_er text,
    id_reg_stat text,
    commentaire text,
    methode_estime integer,
    cubf text,
    id_inv integer NOT NULL,
    n_places_mesure numeric,
    n_places_estime numeric
);


ALTER TABLE public.inventaire_stationnement OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 889869)
-- Name: inventaire_stationnement_id_inv_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventaire_stationnement_id_inv_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventaire_stationnement_id_inv_seq OWNER TO postgres;

--
-- TOC entry 6036 (class 0 OID 0)
-- Dependencies: 257
-- Name: inventaire_stationnement_id_inv_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventaire_stationnement_id_inv_seq OWNED BY public.inventaire_stationnement.id_inv;


--
-- TOC entry 254 (class 1259 OID 19729)
-- Name: jours_de_semaine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jours_de_semaine (
    id_jour integer NOT NULL,
    description_jour character varying(255)
);


ALTER TABLE public.jours_de_semaine OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17742)
-- Name: liste_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.liste_operations (
    id_operation integer NOT NULL,
    desc_operation character varying(255)
);


ALTER TABLE public.liste_operations OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 889978)
-- Name: motorisation_par_quartier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.motorisation_par_quartier (
    id_quartier bigint,
    nb_voitures double precision,
    nb_voitures_max_pav double precision,
    nb_voitures_min_pav double precision,
    diff_max_signee double precision,
    nb_permis double precision
);


ALTER TABLE public.motorisation_par_quartier OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17602)
-- Name: multiplicateur_facteurs_colonnes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.multiplicateur_facteurs_colonnes (
    id_unite integer NOT NULL,
    colonne_role_foncier character varying(255),
    facteur_correction real,
    cubf integer,
    desc_unite character varying(255),
    abscisse_correction real
);


ALTER TABLE public.multiplicateur_facteurs_colonnes OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 889886)
-- Name: od_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.od_data (
    nolog bigint,
    tlog bigint,
    nbper bigint,
    nbveh bigint,
    xlonlog double precision,
    ylatlog double precision,
    sdrlog bigint,
    smlog bigint,
    srlog double precision,
    gslog text,
    facmen double precision,
    clepersonne bigint,
    tper bigint,
    sexe bigint,
    age bigint,
    grpage bigint,
    percond bigint,
    occper bigint,
    xlonocc double precision,
    ylatocc double precision,
    mobil bigint,
    facper double precision,
    facpermc double precision,
    facdep double precision,
    cledeplacement double precision,
    nodep double precision,
    hredep double precision,
    hredepimp double precision,
    heure double precision,
    hrearv double precision,
    motif double precision,
    motif_gr double precision,
    mode1 double precision,
    mode2 double precision,
    mode3 double precision,
    mode4 double precision,
    stat double precision,
    coutstat double precision,
    termstat double precision,
    lieuori double precision,
    xlonori double precision,
    ylatori double precision,
    smori double precision,
    xlondes double precision,
    ylatdes double precision,
    smdes double precision,
    geom_logis public.geometry(Point,4326),
    geom_ori public.geometry(Point,4326),
    geom_des public.geometry(Point,4326),
    trip_line public.geometry(LineString,4326)
);


ALTER TABLE public.od_data OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 890209)
-- Name: parts_modales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parts_modales (
    id_quartier integer,
    ac_res double precision,
    ap_res double precision,
    tc_res double precision,
    mv_res double precision,
    bs_res double precision,
    ac_ori double precision,
    ap_ori double precision,
    tc_ori double precision,
    mv_ori double precision,
    bs_ori double precision,
    ac_des double precision,
    ap_des double precision,
    tc_des double precision,
    mv_des double precision,
    bs_des double precision,
    ac_int double precision,
    ap_int double precision,
    tc_int double precision,
    mv_int double precision,
    bs_int double precision
);


ALTER TABLE public.parts_modales OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 19699)
-- Name: periode_tarifaire; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periode_tarifaire (
    id_periode_tarifaire_emp integer NOT NULL,
    jour integer,
    heure_debut time without time zone,
    heure_fin time without time zone
);


ALTER TABLE public.periode_tarifaire OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 19698)
-- Name: periode_tarifaire_id_periode_tarifaire_emp_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periode_tarifaire_id_periode_tarifaire_emp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.periode_tarifaire_id_periode_tarifaire_emp_seq OWNER TO postgres;

--
-- TOC entry 6037 (class 0 OID 0)
-- Dependencies: 245
-- Name: periode_tarifaire_id_periode_tarifaire_emp_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periode_tarifaire_id_periode_tarifaire_emp_seq OWNED BY public.periode_tarifaire.id_periode_tarifaire_emp;


--
-- TOC entry 260 (class 1259 OID 889973)
-- Name: population_par_quartier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.population_par_quartier (
    id_quartier bigint,
    pop_tot_2021 numeric,
    pop_tot_2016 numeric
);


ALTER TABLE public.population_par_quartier OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 890120)
-- Name: profile_accumulation_vehicule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_accumulation_vehicule (
    id_ent_pav integer NOT NULL,
    id_quartier bigint,
    heure integer,
    voitures integer
);


ALTER TABLE public.profile_accumulation_vehicule OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 890119)
-- Name: profile_accumulation_vehicule_id_ent_PAV_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."profile_accumulation_vehicule_id_ent_PAV_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."profile_accumulation_vehicule_id_ent_PAV_seq" OWNER TO postgres;

--
-- TOC entry 6038 (class 0 OID 0)
-- Dependencies: 263
-- Name: profile_accumulation_vehicule_id_ent_PAV_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."profile_accumulation_vehicule_id_ent_PAV_seq" OWNED BY public.profile_accumulation_vehicule.id_ent_pav;


--
-- TOC entry 237 (class 1259 OID 17736)
-- Name: reg_stationnement_empile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reg_stationnement_empile (
    id_reg_stat_emp integer NOT NULL,
    id_reg_stat integer,
    ss_ensemble integer,
    seuil integer,
    oper integer,
    cases_fix_min double precision,
    cases_fix_max double precision,
    pente_min double precision,
    pente_max double precision,
    unite integer
);


ALTER TABLE public.reg_stationnement_empile OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17735)
-- Name: reg_stationnement_empile_id_reg_stat_emp_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reg_stationnement_empile_id_reg_stat_emp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reg_stationnement_empile_id_reg_stat_emp_seq OWNER TO postgres;

--
-- TOC entry 6039 (class 0 OID 0)
-- Dependencies: 236
-- Name: reg_stationnement_empile_id_reg_stat_emp_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reg_stationnement_empile_id_reg_stat_emp_seq OWNED BY public.reg_stationnement_empile.id_reg_stat_emp;


--
-- TOC entry 241 (class 1259 OID 17903)
-- Name: role_foncier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_foncier (
    id_provinc character varying(255) NOT NULL,
    code_mun character varying(255),
    arrond character varying(255),
    rejet integer,
    date_entree character varying(255),
    mat18 character varying(255),
    anrole character varying(255),
    no_seq_adr character varying(255),
    rl0101a character varying(255),
    rl0101b character varying(255),
    rl0101c character varying(255),
    rl0101d character varying(255),
    rl0101e character varying(255),
    rl0101f character varying(255),
    rl0101g character varying(255),
    rl0101h character varying(255),
    rl0101i character varying(255),
    rl0101j character varying(255),
    rl0104g character varying(255),
    rl0104h character varying(255),
    rl0105a character varying(255),
    rl0106a character varying(255),
    rl0107a character varying(255),
    rl0301a double precision,
    rl0302a double precision,
    rl0303a character varying(255),
    rl0304a double precision,
    rl0305a double precision,
    rl0306a double precision,
    rl0307a character varying(255),
    rl0307b character varying(255),
    rl0308a double precision,
    rl0309a character varying(255),
    rl0311a double precision,
    rl0312a double precision,
    rl0313a double precision,
    rl0402a double precision,
    rl0403a double precision,
    rl0404a integer,
    rl0405a double precision,
    rl0501a character varying(255),
    rl0502a character varying(255),
    rl0503a character varying(255),
    rl0505a character varying(255),
    ind_nouv_ctrid character varying(255),
    dat_cond_mrche timestamp without time zone,
    rl0310a character varying(255),
    rl0314a double precision,
    rl0315a double precision,
    rl0316a double precision,
    geometry public.geometry(Point,4326)
);


ALTER TABLE public.role_foncier OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 22178)
-- Name: sec_analyse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sec_analyse (
    id_quartier bigint NOT NULL,
    nom_quartier text,
    superf_quartier double precision,
    peri_quartier double precision,
    geometry public.geometry(Geometry,4326)
);


ALTER TABLE public.sec_analyse OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 889981)
-- Name: stat_agrege; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stat_agrege (
    geom public.geometry,
    superf_quartier double precision,
    inv_123 integer,
    inv_132 integer,
    inv_213 integer,
    inv_231 integer,
    inv_312 integer,
    inv_321 integer,
    id_quartier bigint NOT NULL,
    nom_quartier character varying(255)
);


ALTER TABLE public.stat_agrege OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 19691)
-- Name: table_entete_tarif_id_tarif_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.table_entete_tarif_id_tarif_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.table_entete_tarif_id_tarif_seq OWNER TO postgres;

--
-- TOC entry 6040 (class 0 OID 0)
-- Dependencies: 243
-- Name: table_entete_tarif_id_tarif_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.table_entete_tarif_id_tarif_seq OWNED BY public.entete_tarifs.id_tarif;


--
-- TOC entry 240 (class 1259 OID 17770)
-- Name: visu_reg_tete_a_reg_empile_2; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.visu_reg_tete_a_reg_empile_2 AS
 SELECT head.id_reg_stat,
    head.description,
    head.annee_debut_reg,
    head.annee_fin_reg,
    head.texte_loi,
    head.article_loi,
    head.paragraphe_loi,
    head.ville,
    emp.ss_ensemble,
    emp.seuil,
    emp.oper,
    emp.cases_fix_min,
    emp.cases_fix_max,
    emp.pente_min,
    emp.pente_max,
    emp.unite,
    mult.desc_unite
   FROM public.reg_stationnement_empile emp,
    public.entete_reg_stationnement head,
    public.multiplicateur_facteurs_colonnes mult
  WHERE ((emp.id_reg_stat = head.id_reg_stat) AND (mult.id_unite = emp.unite));


ALTER VIEW public.visu_reg_tete_a_reg_empile_2 OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17765)
-- Name: visu_ens_a_reg; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.visu_ens_a_reg AS
 SELECT ens.id_er AS ensemble,
    ens.description_er,
    ass.cubf,
    cubf.description AS desc_cubf,
    head.id_reg_stat,
    head.description,
    head.ss_ensemble,
    head.seuil,
    head.oper,
    head.cases_fix_min,
    head.cases_fix_max,
    head.pente_min,
    head.pente_max,
    head.unite,
    head.desc_unite
   FROM public.association_er_reg_stat ass,
    public.ensembles_reglements_stat ens,
    public.visu_reg_tete_a_reg_empile_2 head,
    public.cubf
  WHERE ((ass.id_er = ens.id_er) AND (head.id_reg_stat = ass.id_reg_stat) AND (cubf.cubf = ass.cubf));


ALTER VIEW public.visu_ens_a_reg OWNER TO postgres;

--
-- TOC entry 5760 (class 2604 OID 17687)
-- Name: association_er_reg_stat id_assoc_er_reg; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.association_er_reg_stat ALTER COLUMN id_assoc_er_reg SET DEFAULT nextval('public.association_er_reg_stat_id_assoc_seq'::regclass);


--
-- TOC entry 5761 (class 2604 OID 17697)
-- Name: association_er_territoire id_asso_er_ter; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.association_er_territoire ALTER COLUMN id_asso_er_ter SET DEFAULT nextval('public.association_er_territoire_id_association_seq'::regclass);


--
-- TOC entry 5768 (class 2604 OID 19716)
-- Name: association_tarifs id_tarif_emp; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.association_tarifs ALTER COLUMN id_tarif_emp SET DEFAULT nextval('public.association_tarifs_id_tarif_emp_seq'::regclass);


--
-- TOC entry 5759 (class 2604 OID 17657)
-- Name: cartographie_secteurs id_periode_geo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartographie_secteurs ALTER COLUMN id_periode_geo SET DEFAULT nextval('public.cartographie_secteurs_id_periode_geo_seq'::regclass);


--
-- TOC entry 5767 (class 2604 OID 19709)
-- Name: couts_tarifaires id_couts_emp; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couts_tarifaires ALTER COLUMN id_couts_emp SET DEFAULT nextval('public.couts_tarifaires_id_couts_seq'::regclass);


--
-- TOC entry 5762 (class 2604 OID 17704)
-- Name: ensembles_reglements_stat id_er; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ensembles_reglements_stat ALTER COLUMN id_er SET DEFAULT nextval('public.ensembles_reglements_stat_id_er_stat_seq'::regclass);


--
-- TOC entry 5769 (class 2604 OID 19723)
-- Name: entete_couts_tarifs id_couts; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entete_couts_tarifs ALTER COLUMN id_couts SET DEFAULT nextval('public.entete_couts_tarifs_id_couts_seq'::regclass);


--
-- TOC entry 5763 (class 2604 OID 17720)
-- Name: entete_reg_stationnement id_reg_stat; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entete_reg_stationnement ALTER COLUMN id_reg_stat SET DEFAULT nextval('public.entete_reg_stationnement_id_reg_stat_seq'::regclass);


--
-- TOC entry 5765 (class 2604 OID 19695)
-- Name: entete_tarifs id_tarif; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entete_tarifs ALTER COLUMN id_tarif SET DEFAULT nextval('public.table_entete_tarif_id_tarif_seq'::regclass);


--
-- TOC entry 5758 (class 2604 OID 17486)
-- Name: historique_geopol id_periode; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_geopol ALTER COLUMN id_periode SET DEFAULT nextval('public.historique_geopol_id_periode_geo_seq'::regclass);


--
-- TOC entry 5770 (class 2604 OID 889870)
-- Name: inventaire_stationnement id_inv; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaire_stationnement ALTER COLUMN id_inv SET DEFAULT nextval('public.inventaire_stationnement_id_inv_seq'::regclass);


--
-- TOC entry 5766 (class 2604 OID 19702)
-- Name: periode_tarifaire id_periode_tarifaire_emp; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periode_tarifaire ALTER COLUMN id_periode_tarifaire_emp SET DEFAULT nextval('public.periode_tarifaire_id_periode_tarifaire_emp_seq'::regclass);


--
-- TOC entry 5771 (class 2604 OID 890123)
-- Name: profile_accumulation_vehicule id_ent_pav; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_accumulation_vehicule ALTER COLUMN id_ent_pav SET DEFAULT nextval('public."profile_accumulation_vehicule_id_ent_PAV_seq"'::regclass);


--
-- TOC entry 5764 (class 2604 OID 17739)
-- Name: reg_stationnement_empile id_reg_stat_emp; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reg_stationnement_empile ALTER COLUMN id_reg_stat_emp SET DEFAULT nextval('public.reg_stationnement_empile_id_reg_stat_emp_seq'::regclass);


--
-- TOC entry 5784 (class 2606 OID 17692)
-- Name: association_er_reg_stat association_er_reg_stat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.association_er_reg_stat
    ADD CONSTRAINT association_er_reg_stat_pkey PRIMARY KEY (id_assoc_er_reg);


--
-- TOC entry 5786 (class 2606 OID 17699)
-- Name: association_er_territoire association_er_territoire_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.association_er_territoire
    ADD CONSTRAINT association_er_territoire_pkey PRIMARY KEY (id_asso_er_ter);


--
-- TOC entry 5804 (class 2606 OID 19718)
-- Name: association_tarifs association_tarifs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.association_tarifs
    ADD CONSTRAINT association_tarifs_pkey PRIMARY KEY (id_tarif_emp);


--
-- TOC entry 5782 (class 2606 OID 17661)
-- Name: cartographie_secteurs cartographie_secteurs_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cartographie_secteurs
    ADD CONSTRAINT cartographie_secteurs_pkey1 PRIMARY KEY (id_periode_geo);


--
-- TOC entry 5802 (class 2606 OID 19711)
-- Name: couts_tarifaires couts_tarifaires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couts_tarifaires
    ADD CONSTRAINT couts_tarifaires_pkey PRIMARY KEY (id_couts_emp);


--
-- TOC entry 5778 (class 2606 OID 17534)
-- Name: cubf cubf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cubf
    ADD CONSTRAINT cubf_pkey PRIMARY KEY (cubf);


--
-- TOC entry 5788 (class 2606 OID 17706)
-- Name: ensembles_reglements_stat ensembles_reglements_stat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ensembles_reglements_stat
    ADD CONSTRAINT ensembles_reglements_stat_pkey PRIMARY KEY (id_er);


--
-- TOC entry 5806 (class 2606 OID 19725)
-- Name: entete_couts_tarifs entete_couts_tarifs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entete_couts_tarifs
    ADD CONSTRAINT entete_couts_tarifs_pkey PRIMARY KEY (id_couts);


--
-- TOC entry 5790 (class 2606 OID 17724)
-- Name: entete_reg_stationnement entete_reg_stationnement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entete_reg_stationnement
    ADD CONSTRAINT entete_reg_stationnement_pkey PRIMARY KEY (id_reg_stat);


--
-- TOC entry 5776 (class 2606 OID 17488)
-- Name: historique_geopol historique_geopol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_geopol
    ADD CONSTRAINT historique_geopol_pkey PRIMARY KEY (id_periode);


--
-- TOC entry 5813 (class 2606 OID 889877)
-- Name: inventaire_stationnement inventaire_stationnement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaire_stationnement
    ADD CONSTRAINT inventaire_stationnement_pkey PRIMARY KEY (id_inv);


--
-- TOC entry 5808 (class 2606 OID 19733)
-- Name: jours_de_semaine jours_de_semaine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jours_de_semaine
    ADD CONSTRAINT jours_de_semaine_pkey PRIMARY KEY (id_jour);


--
-- TOC entry 5794 (class 2606 OID 17746)
-- Name: liste_operations liste_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.liste_operations
    ADD CONSTRAINT liste_operations_pkey PRIMARY KEY (id_operation);


--
-- TOC entry 5780 (class 2606 OID 887901)
-- Name: multiplicateur_facteurs_colonnes multiplicateur_facteurs_colonnes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplicateur_facteurs_colonnes
    ADD CONSTRAINT multiplicateur_facteurs_colonnes_pkey PRIMARY KEY (id_unite);


--
-- TOC entry 5800 (class 2606 OID 19704)
-- Name: periode_tarifaire periode_tarifaire_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periode_tarifaire
    ADD CONSTRAINT periode_tarifaire_pkey PRIMARY KEY (id_periode_tarifaire_emp);


--
-- TOC entry 5821 (class 2606 OID 890125)
-- Name: profile_accumulation_vehicule profile_accumulation_vehicule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_accumulation_vehicule
    ADD CONSTRAINT profile_accumulation_vehicule_pkey PRIMARY KEY (id_ent_pav);


--
-- TOC entry 5823 (class 2606 OID 890127)
-- Name: profile_accumulation_vehicule quartier_heure; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_accumulation_vehicule
    ADD CONSTRAINT quartier_heure UNIQUE (id_quartier, heure);


--
-- TOC entry 5792 (class 2606 OID 17741)
-- Name: reg_stationnement_empile reg_stationnement_empile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reg_stationnement_empile
    ADD CONSTRAINT reg_stationnement_empile_pkey PRIMARY KEY (id_reg_stat_emp);


--
-- TOC entry 5796 (class 2606 OID 17914)
-- Name: role_foncier role_foncier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_foncier
    ADD CONSTRAINT role_foncier_pkey PRIMARY KEY (id_provinc);


--
-- TOC entry 5811 (class 2606 OID 22207)
-- Name: sec_analyse sec_analyse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sec_analyse
    ADD CONSTRAINT sec_analyse_pkey PRIMARY KEY (id_quartier);


--
-- TOC entry 5819 (class 2606 OID 890078)
-- Name: stat_agrege stat_agrege_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stat_agrege
    ADD CONSTRAINT stat_agrege_pkey PRIMARY KEY (id_quartier);


--
-- TOC entry 5798 (class 2606 OID 19697)
-- Name: entete_tarifs table_entete_tarif_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entete_tarifs
    ADD CONSTRAINT table_entete_tarif_pkey PRIMARY KEY (id_tarif);


--
-- TOC entry 5815 (class 2606 OID 889879)
-- Name: inventaire_stationnement unique_g_no_lot_methode_estime ; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventaire_stationnement
    ADD CONSTRAINT "unique_g_no_lot_methode_estime " UNIQUE (g_no_lot, methode_estime);


--
-- TOC entry 5824 (class 1259 OID 890217)
-- Name: idx_census_population_2016_geometry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_census_population_2016_geometry ON public.census_population_2016 USING gist (geometry);


--
-- TOC entry 5817 (class 1259 OID 889965)
-- Name: idx_census_population_geometry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_census_population_geometry ON public.census_population USING gist (geometry);


--
-- TOC entry 5816 (class 1259 OID 889891)
-- Name: idx_od_data_geom_logis; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_od_data_geom_logis ON public.od_data USING gist (geom_logis);


--
-- TOC entry 5809 (class 1259 OID 888025)
-- Name: idx_sec_analyse_geometry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sec_analyse_geometry ON public.sec_analyse USING gist (geometry);


-- Completed on 2025-06-07 23:06:41

--
-- PostgreSQL database dump complete
--

