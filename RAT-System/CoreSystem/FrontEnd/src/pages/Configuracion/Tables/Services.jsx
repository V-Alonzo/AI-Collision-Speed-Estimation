
import { getAxiosLumen } from '../../../components/Global/funciones'

export const DetalleColumnas = async (setloading ,msErrorApi ,keycloak ,logoutOptions, id) => {
     const response = await getAxiosLumen({
        uri:`configuracion/tables/columns/${id}`,
        setloading: setloading,
        msErrorApi: msErrorApi,
        keycloak: keycloak,
        notification: false,
        request: 'get',
        logoutOptions: logoutOptions

    })
    return response
}
export const TableAtributtes = async (setloading ,msErrorApi ,keycloak ,logoutOptions, id,dfi) => {
    const response = await getAxiosLumen({
       uri: `configuracion/tables/columns/attributes/${id}?_dti=${dfi}`,
       setloading: setloading,
       msErrorApi: msErrorApi,
       keycloak: keycloak,
       notification: false,
       request: 'get',
       logoutOptions: logoutOptions

   })
   return response
}
export const AddColumnaForm = async (setloading ,msErrorApi ,keycloak ,logoutOptions, parametros, request) => {
    const response = await getAxiosLumen({
       uri: `configuracion/tables/columns/attributes`,
       setloading: setloading,
       msErrorApi: msErrorApi,
       keycloak: keycloak,
       notification: true,
       request: request?request:'post',
       logoutOptions: logoutOptions,
       parametros,
   })
   return response
}
export const DeleteElementColumn = async (setloading ,msErrorApi ,keycloak ,logoutOptions, data_form_id) => {
    const response = await getAxiosLumen({
       uri: `configuracion/tables/columns/${data_form_id}`,
       setloading: setloading,
       msErrorApi: msErrorApi,
       keycloak: keycloak,
       notification: true,
       request: 'delete',
       logoutOptions: logoutOptions,       
   })
   return response
}

export default DetalleColumnas;