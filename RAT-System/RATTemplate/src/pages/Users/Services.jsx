
// import React, {useContext} from "react";
import { getAxiosLumen } from '../../components/Global/funciones'

export const DataUser = async (setloading, msErrorApi, keycloak, logoutOptions) => {
    const response = await getAxiosLumen({
        uri: `/user`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions

    })
    return response
}

export const UpdateElement = async (setloading, msErrorApi, keycloak, logoutOptions, data_id, parametros) => {
    const response = await getAxiosLumen({
        uri: `/user/${data_id}`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: true,
        request: 'put',
        logoutOptions: logoutOptions,
        parametros: parametros,
    })
    return response
}

export const MenuPermissions = async (setloading, msErrorApi, keycloak, logoutOptions, data_id, parametros,) => {
    const response = await getAxiosLumen({
        uri: `/user/${data_id}/permisos`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'post',
        logoutOptions: logoutOptions,
        parametros,
    })
    return response
}

export const UpdatePermissions = async (setloading, msErrorApi, keycloak, logoutOptions, uri, request, parametros) => {
    const response = await getAxiosLumen({
        uri: uri,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: request,
        logoutOptions: logoutOptions,
        parametros,
    })
    return response
}




export default DataUser;