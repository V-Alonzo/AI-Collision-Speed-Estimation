
// import React, {useContext} from "react";
import { getAxiosLumen } from '../../components/Global/funciones'

export const apiVerificacionUsuario = async (setloading, msErrorApi, keycloak, logoutOptions, id_keycloack) => {
    const response = await getAxiosLumen({
        uri: `user/VerificacionUsuario/${id_keycloack}`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions,

    })
    return response
}

export const apiHandleEnviarCodigo = async (setloading, msErrorApi, keycloak, logoutOptions, id_keycloack) => {
    const response = await getAxiosLumen({
        uri: `user/apiHandleEnviarCodigo/${id_keycloack}`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions,

    })
    return response
}

export const apiHandleValidarCodigo = async (setloading, msErrorApi, keycloak, logoutOptions, id_keycloack, codigoAcceso) => {
    const response = await getAxiosLumen({
        uri: `user/apiHandleValidarCodigo/${id_keycloack}/${codigoAcceso}`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions,

    })
    return response
}
export default apiVerificacionUsuario;