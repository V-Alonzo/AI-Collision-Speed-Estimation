
import { getAxiosLumen, CryptoJSAesEncrypt  } from '../../components/Global/funciones'

//CloudPlatform
export const ModulosPermissions = async (setloading, msErrorApi, keycloak, logoutOptions, data_id) => {
    const response = await getAxiosLumen({
        uri: `/menu/${data_id}/modulos`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions,
    })
    return response
}
//Layout
export const DataMenu = async (setloading ,msErrorApi ,keycloak ,logoutOptions, id, user) => {
     const response = await getAxiosLumen({
        uri:`menu/${id}?_us=${CryptoJSAesEncrypt(user)}`,       
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions

    })
    return response
}

//HeaderComponent
export const DataOneUser = async (setloading, msErrorApi, keycloak, logoutOptions,data_id) => {
    const response = await getAxiosLumen({
        uri: `/user/${data_id}`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions

    })
    return response
}

export default DataMenu;