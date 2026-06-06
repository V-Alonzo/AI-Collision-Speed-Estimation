
// import React, {useContext} from "react";
import { getAxiosLumenMultForData, getAxiosLumen } from '../../../components/Global/funciones'

export const PreseferenciasUpdate = async (setloading, msErrorApi, keycloak, logoutOptions, formdata) => {
    const response = await getAxiosLumenMultForData({
        uri: `configuracion/preferencias`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'post',
        logoutOptions: logoutOptions,
        parametros: formdata

    })
    return response
}

export const apiUpdatePreferenciasModelos = async (setloading, msErrorApi, keycloak, logoutOptions, parametros) => {
    const response = await getAxiosLumen({
        uri: `configuracion/UpdatePreferenciasModelos`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'post',
        logoutOptions: logoutOptions,
        parametros: parametros

    })
    return response
}


export const apiConsultaDataConstantes = async (setloading, msErrorApi, keycloak, logoutOptions) => {
    const response = await getAxiosLumen({
        uri: `configuracion/apiConsultaDataConstantes`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions,

    })
    return response
}


export default PreseferenciasUpdate;