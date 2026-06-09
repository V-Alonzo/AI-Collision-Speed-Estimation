
// import React, {useContext} from "react";
import { getAxiosLumen } from '../../components/Global/funciones'

export const apiConsultaDataForm = async (setloading, msErrorApi, keycloak, logoutOptions) => {
    const response = await getAxiosLumen({
        uri: `VisorConsultas/showDataFormFiltros`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions,

    })
    return response
}


export const apiConsultaDataVisor = async (setloading, msErrorApi, keycloak, logoutOptions, parametros) => {
  
    const response = await getAxiosLumen({
        uri: `VisorConsultas/apiConsultaDataVisor`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'put',
        logoutOptions: logoutOptions,
        parametros

    })
    return response
}


export const apiOnVerDetalle = async (setloading, msErrorApi, keycloak, logoutOptions, parametros) => {
  
    const response = await getAxiosLumen({
        uri: `VisorConsultas/apiOnVerDetalle`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'put',
        logoutOptions: logoutOptions,
        parametros
        

    })
    return response
}

export default apiConsultaDataForm;