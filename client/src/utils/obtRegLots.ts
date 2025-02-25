import { serviceEnsemblesReglements } from "../services";


const ObtRegLots =(ids:string[]) =>{
    const ensRegReduit = serviceEnsemblesReglements.chercheEnsRegPourRole(ids);
    return ensRegReduit
}

export default ObtRegLots;