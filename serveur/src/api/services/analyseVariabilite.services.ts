import {Pool} from 'pg'
import * as repo from '../repositories/analyseVariabilite.repositories'

export const gereObtentionAnaVar = async(
    pool:Pool, 
    params:{
        id_er: number[],
        cubf_n1: number,
        id_ref: number,
        voir_inv:boolean,
        inclure_echelle:boolean,
        somme_sur_total: boolean
    })=>{
        const sql = repo.construitRequeteSQLAnavar(params) 
        const rows = await repo.rouleRequeteSQL(pool,sql)
        return rows
}
