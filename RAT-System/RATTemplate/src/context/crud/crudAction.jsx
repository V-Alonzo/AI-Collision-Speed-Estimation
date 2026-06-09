import React, { useContext, useReducer } from "react";
import CrudContext from "./crudContext";
import CrudReducer from "./crudReducer";
import { Form } from "antd";
import {
    CRUD_SHOW_INIT, CRUD_SHOW, CRUD_SHOW_ERROR, CRUD_SAVE_INIT,
    CRUD_SAVE, CRUD_SAVE_ERROR, CRUD_EDIT_INIT, CRUD_EDIT,
    CRUD_EDIT_ERROR, CRUD_ON_MODAL, CRUD_ON_BTN_TITLE, CRUD_ON_ROWID,
} from "./../../types";

import { useKeycloak } from "@react-keycloak/web";
import ThemeContext from '../ThemContext.jsx'

import { getAxiosLumen } from './../../components/Global/funciones.jsx'


const CrudAction = (props) => {

    // Hook y funciones o metodos Globales
    const themeContext = useContext(ThemeContext)
    const { msErrorApi, logoutOptions } = themeContext

    const { keycloak } = useKeycloak();

    const [form_antd] = Form.useForm();
    const initialState = {
        datasource: [],
        loading: false,
        error: false,
        openmodal: false,
        btntitle: "Guardar",
        currentrowid: 0,
        form: form_antd,
    };
    const [state, dispatch] = useReducer(CrudReducer, initialState);

    const openModalCAction = () => {
        dispatch(onModal(true));
    };
    const closeModalCAction = () => {
        dispatch(onModal(false));
    };
    const onModal = (data) => ({
        type: CRUD_ON_MODAL,
        payload: data,
    });
    const chTitleBtnCAction = (txt) => {
        dispatch(onBtnTitle(txt));
    };
    const onBtnTitle = (data) => ({
        type: CRUD_ON_BTN_TITLE,
        payload: data,
    });
    const chCurrentRowIDAction = (id) => {
        dispatch(onCurrentRowID(id));
    };
    const onCurrentRowID = (data) => ({
        type: CRUD_ON_ROWID,
        payload: data,
    });
    const obtenerDatosAction = async (uri) => {
        dispatch(descargarDatos());
        try {
            const response = await getAxiosLumen({
                uri: uri,
                msErrorApi: msErrorApi,
                keycloak: keycloak,
                notification: false,
                request: 'get',
                logoutOptions: logoutOptions

            })
            //console.log('obtenerDatosAction',response)
            dispatch(mostrarDatos(response));
        } catch (error) {
            dispatch(mostrarDatosError());
        }
    };
    const descargarDatos = () => ({
        type: CRUD_SHOW_INIT,
        payload: true,
    });
    const mostrarDatos = (data) => ({
        type: CRUD_SHOW,
        payload: data,
    });
    const mostrarDatosError = () => ({
        type: CRUD_SHOW_ERROR,
        payload: true,
    });
    const guardarDatosAction = async (uri, values) => {
        dispatch(guardarInit());
        try {

            const response = await getAxiosLumen({
                uri: uri,
                msErrorApi: msErrorApi,
                keycloak: keycloak,
                notification: true,
                request: 'post',
                logoutOptions: logoutOptions,
                parametros: values

            })
            obtenerDatosAction(uri)
            dispatch(guardar(response));
            dispatch(onModal(false));

        } catch (error) {
            dispatch(guardarError());
        }
    };
    const guardarInit = () => ({
        type: CRUD_SAVE_INIT,
        payload: true,
    });
    const guardar = (data) => ({
        type: CRUD_SAVE,
        payload: data,
    });
    const guardarError = () => ({
        type: CRUD_SAVE_ERROR,
        payload: true,
    });
    const editarDatosAction = async (uri, values, id, request = 'put') => {
        dispatch(editarInit());
        try {

            const response = await getAxiosLumen({
                uri: uri + '/' + id,
                msErrorApi: msErrorApi,
                keycloak: keycloak,
                notification: true,
                request: request,
                logoutOptions: logoutOptions,
                parametros: values

            })

            obtenerDatosAction(uri)
            dispatch(editar(response));
            dispatch(onModal(false));

        } catch (error) {
            dispatch(editarError());
        }

    };
    const editarInit = () => ({
        type: CRUD_EDIT_INIT,
        payload: true,
    });
    const editar = (data) => ({
        type: CRUD_EDIT,
        payload: data,
    });
    const editarError = () => ({
        type: CRUD_EDIT_ERROR,
        payload: true,
    });

    const loadingCrud = (payload) => ({
        type: "CRUD_LOADING",
        payload: payload,
    });

    const setLoadingCrud = (payload) => (
        dispatch(loadingCrud(payload))
    );

    const datasourceCrud = (payload) => ({
        type: "CRUD_DATASOURCE",
        payload: payload,
    });

    const setDataSourceCrud = (payload) => (
        dispatch(datasourceCrud(payload))
    );


    return (
        <CrudContext.Provider
            value={{
                datasource: state.datasource,
                loading: state.loading,
                error: state.error,
                openmodal: state.openmodal,
                btntitle: state.btntitle,
                currentrowid: state.currentrowid,
                form: state.form,
                obtenerDatosAction,
                guardarDatosAction,
                editarDatosAction,
                openModalCAction,
                closeModalCAction,
                chCurrentRowIDAction,
                chTitleBtnCAction,

                setLoadingCrud,
                setDataSourceCrud,

            }}
        >
            {props.children}
        </CrudContext.Provider>
    );
};
export default CrudAction;