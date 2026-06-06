
// import React, {useContext} from "react";
import { getAxiosLumen } from '../Global/funciones'

export const CatCatalogos = async (setloading ,msErrorApi ,keycloak ,logoutOptions, id) => {
     const response = await getAxiosLumen({
        uri:`configuracion/catalogs`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions

    })
    return response
}

export default CatCatalogos;