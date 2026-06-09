import { getAxiosLumen } from "../../../components/Global/funciones";

export const GetDataCatalogoGral = async (setloading, msErrorApi, keycloak, logoutOptions, tipoCatalogo) => {
    const response = await getAxiosLumen({
        uri: `CatalogosGrales/getDataCatalogoGral/${tipoCatalogo}`,
        setloading,
        msErrorApi,
        keycloak,
        notification: false,
        request: "get",
        logoutOptions
        
    });

    return response;
};

export const putCRUDCatalogo = async (setloading, msErrorApi, keycloak, logoutOptions, parametros, accion, tipoCatalogo) => {
    const response = await getAxiosLumen({
        uri: `CatalogosGrales/putCRUDCatalogo/${tipoCatalogo}/${accion}`,
        setloading,
        msErrorApi,
        keycloak,
        notification: false,
        request: "put",
        logoutOptions,
        parametros
        
    });

    return response;
};

export default GetDataCatalogoGral;