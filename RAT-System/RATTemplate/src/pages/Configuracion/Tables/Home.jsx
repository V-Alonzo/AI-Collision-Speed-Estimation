import React, { useState, useContext, useEffect } from "react";
import CrudContext from "../../../context/crud/crudContext";
import Crud from "../../../components/Global/Crud";
import ThemeContext from "../../../context/ThemContext";
import { useKeycloak } from "@react-keycloak/web";
import { FormAntdCrud } from "../../../components/Global/FormComponent";
import { ModdalANTD } from "../../../components/Global/ModalComponent";
import TablaANTD from "../../../components/Global/TablaComponent";
import DrawerAntd from "../../../components/Global/DrawerComponent";
import { DetalleColumnas, TableAtributtes, AddColumnaForm, DeleteElementColumn, } from "./Services";
import { Button } from "antd";

//MIU
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';


const Home = () => {
    const crudContext = useContext(CrudContext);
    const themeContext = useContext(ThemeContext);
    const { keycloak } = useKeycloak();
    const [uri] = useState("configuracion/tables");

    const { datasource, form, loading, currentrowid, obtenerDatosAction, editarDatosAction, openModalCAction, chCurrentRowIDAction, chTitleBtnCAction, setLoadingCrud, } = crudContext;
    const { msErrorApi, logoutOptions, } = themeContext;

    useEffect(() => { ActualizaTabla(); }, [])

    const ActualizaTabla = () => { obtenerDatosAction(uri) };
    const OnClickAction = (row, key, event) => { swicthComponentAction[key](row, event) }

    const swicthComponentAction = {
        Eliminar: (row) => onEliminarRow(row),
        Editar: (row) => onEditarRow(row),
        "Agregar Columnas": (row) => DetalleComponentes(row),

        Input: (row, event) => onInputAttribute(row, event),
        "Editar Columna": (row) => EditElement(row),
        "Eliminar Columna": (row) => onEliminarRowElemento(row),
    }

    const onEditarRow = (row) => {
        form.resetFields()
        form.setFieldsValue(row);
        chCurrentRowIDAction(row.table_id);
        chTitleBtnCAction("Editar");
        openModalCAction();
    }

    const onEliminarRow = (row) => {
        row["sys_tables@status"] = "baja";
        editarDatosAction(uri, row, row.table_id);
    }

    const [rowForms, setRowForms] = useState([]);
    const [visible, setVisible] = useState(false);
    const [visibleDrawer, setVisibleDrawer] = useState(false);
    const [datasourceDetalle, setDataSourceDetalle] = useState([]);
    const [columnsDetalle, setColumnsDetalle] = useState([]);
    const [loadingDetalle, setloadingDetalle] = useState(false);
    const [tablePropsDetalle, setTablePropsDetalle] = useState([]);
    const [formPropsDetalle, setFormTablePropsDetalle] = useState([]);


    const DetalleComponentes = async (row) => {
        setLoadingCrud(true);
        const response = await DetalleColumnas(
            setloadingDetalle,
            msErrorApi,
            keycloak,
            logoutOptions,
            row.table_id
        );

        ////console.log("DetalleComponentes",response)
        setDataSourceDetalle(response.data);
        setColumnsDetalle(response.columns);
        setTablePropsDetalle(response.props_table);
        setFormTablePropsDetalle(response.formItems);
        setRowForms(row);
        chCurrentRowIDAction(row.table_id);
        setVisible(true);
        setLoadingCrud(false);
    }

    const [loadingAdd, setlLoadingAdd] = useState(false);
    const [editElementBand, setEditElementBand] = useState(false);
    const [editElementBandT, setEditElementBandT] = useState("add");
    const [loadingAtributos, setlLoadingAtributos] = useState(false);

    const NewElement = () => {
        setEditElementBand(false)
        setDataSourceAttributes([]);
        setColumnsAttributes([]);
        setlLoadingAdd(true);
        setVisibleDrawer(true);
        setlLoadingAdd(false);
    }

    const onChangeSelect = (value, event, key) => {
        newcomponent = []
        setNewcomponentHook([])
        setEditElementBandT('add')
        TablaAtributos(value, 0);
    }

    let newcomponent = [];
    const [newcomponentHook, setNewcomponentHook] = useState([]);
    const [colmnsattributes, setColumnsAttributes] = useState([]);
    const [datasourceattributes, setDataSourceAttributes] = useState([]);

    const TablaAtributos = async (id, dfi) => {
        setlLoadingAtributos(true)
        const response = await TableAtributtes(
            setloadingDetalle,
            msErrorApi,
            keycloak,
            logoutOptions,
            id,
            dfi
        );
        setDataSourceAttributes(response.data);
        setColumnsAttributes(response.columns);
        response.data.forEach(row => { onInputAttribute(row, undefined, row.defaultValue) });
        setNewcomponentHook(newcomponent)
        setlLoadingAtributos(false)

    }

    const onInputAttribute = (row, event, value) => {
        let attribute = {
            element_id: row.element_id,
            attribute_id: row.attribute_column_id,
            value: event ? event.target.value : value,
            type: "column",
        };
        if (validarNewComponnet(attribute)) {
            newcomponent = newcomponent.filter(
                (comp) => comp.attribute_id !== attribute.attribute_id
            );
        }
        newcomponent.push(attribute);

    }

    const validarNewComponnet = (attribute) => {
        let aux = newcomponent.find(
            (comp) => comp.attribute_id === attribute.attribute_id
        );
        if (aux !== undefined) {
            return true;
        }
        return false;
    }

    const [componentNo, setComponentNo] = useState(0);
    const addElementForm = async () => {
        let newcomponentFin = [...newcomponentHook];
        newcomponent.forEach(row => {
            let attribute = {
                element_id: row.element_id,
                attribute_id: row.attribute_id,
                value: row.value,
                type: "column",
            };
            if (validarNewComponnet(attribute)) {
                newcomponentFin = newcomponentFin.filter(
                    (comp) => comp.attribute_id !== attribute.attribute_id
                );
            }
            newcomponentFin.push(attribute);
        });

        let parameters = {
            table_id: currentrowid,
            component_no: componentNo,
            component: newcomponentFin
        }
        await AddColumnaForm(
            setloadingDetalle,
            msErrorApi,
            keycloak,
            logoutOptions,
            parameters,
            editElementBandT === 'edit' && "put"
        );
        DetalleComponentes(rowForms)
        setVisibleDrawer(false);
    }


    const EditElement = (row) => {
        console.log("EditElement", row)

        setEditElementBandT('edit')
        setComponentNo(row.component_no)
        setEditElementBand(row.columna)
        TablaAtributos(row.element_id, row.component_no);
        setlLoadingAdd(true);
        setVisibleDrawer(true);
        setlLoadingAdd(false);
    }

    const onEliminarRowElemento = async (row) => {
        await DeleteElementColumn(
            setLoadingCrud,
            msErrorApi,
            keycloak,
            logoutOptions,
            row.data_table_id
        );

        DetalleComponentes(rowForms)
    }

    const CloseDrawable = () => {

        setEditElementBand(false)
        setVisibleDrawer(false)

        newcomponent = []
        setEditElementBandT('add')
        setComponentNo(0)
        setDataSourceAttributes([])
        setColumnsAttributes([])
        setNewcomponentHook([])
    }


    return (
        <>

            <ModdalANTD
                visible={visible}
                title={" "}
                footer={false}
                onCancel={() => setVisible(false)}
                width={"85%"}
                height={"85%"}
                centered
            >
                <TablaANTD
                    loadingAdd={loadingAdd}
                    loading={loading}
                    columnsTable={columnsDetalle}
                    datasource={datasourceDetalle}
                    pagination={tablePropsDetalle && tablePropsDetalle.pagination}
                    pageSize={tablePropsDetalle && tablePropsDetalle.pageSize}
                    simplepage={tablePropsDetalle && tablePropsDetalle.simplepage}
                    positionBottom={tablePropsDetalle && tablePropsDetalle.positionBottom}
                    positionTop={tablePropsDetalle && tablePropsDetalle.positionTop}
                    size={tablePropsDetalle && tablePropsDetalle.size}
                    bordered={tablePropsDetalle && tablePropsDetalle.bordered}
                    scrollX={tablePropsDetalle && tablePropsDetalle.scrollX}
                    scrollY={tablePropsDetalle && tablePropsDetalle.scrollY}
                    tableLayout={tablePropsDetalle && tablePropsDetalle.tableLayout}
                    Title={rowForms['sys_tables@name_table']}
                    IconAvatar={tablePropsDetalle && tablePropsDetalle.IconAvatar}
                    OnClickAction={OnClickAction}
                    ActualizaTabla={() => DetalleComponentes(rowForms)}
                    Agregar={() => NewElement()}
                    AgregarIcon={tablePropsDetalle && tablePropsDetalle.IconAgregar}
                >
                    <DrawerAntd
                        title={!editElementBand ? " Nueva Columna" : editElementBand}
                        onClose={() => CloseDrawable()}
                        visible={visibleDrawer}
                        // getContainer={false}
                        style={{ position: "absolute" }}
                    >

                        {!editElementBand &&
                            <FormAntdCrud
                                formItems={formPropsDetalle}
                                onChangeSelect={onChangeSelect}
                            />
                        }

                        <TablaANTD
                            tbSimple={true}
                            loading={loadingAtributos}
                            columnsTable={colmnsattributes}
                            datasource={datasourceattributes}
                            pagination={tablePropsDetalle && tablePropsDetalle.pagination}
                            pageSize={tablePropsDetalle && tablePropsDetalle.pageSize}
                            simplepage={tablePropsDetalle && tablePropsDetalle.simplepage}
                            positionBottom={tablePropsDetalle && tablePropsDetalle.positionBottom}
                            positionTop={tablePropsDetalle && tablePropsDetalle.positionTop}
                            size={tablePropsDetalle && tablePropsDetalle.size}
                            bordered={tablePropsDetalle && tablePropsDetalle.bordered}
                            scrollX={tablePropsDetalle && tablePropsDetalle.scrollX}
                            scrollY={tablePropsDetalle && tablePropsDetalle.scrollY}
                            tableLayout={tablePropsDetalle && tablePropsDetalle.tableLayout}
                            // Title={rowForms.name_table}
                            // IconAvatar={tablePropsDetalle && tablePropsDetalle.IconAvatar}

                            OnClickAction={OnClickAction}
                        />
                        <div style={{ textAlign: 'center' }}>
                            {datasourceattributes.length > 0 &&
                                <Button loading={loadingDetalle} type="primary"
                                    onClick={() => addElementForm()}
                                >
                                    {!editElementBand ? "  Agregar elemento" : "  Modificar elemento"}
                                </Button>
                            }
                        </div>
                    </DrawerAntd>

                </TablaANTD>
            </ModdalANTD>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    '& > :not(style)': { m: 1, width: '96%', height: '100%', },
                }}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Crud
                            title={"Nuevo Tabla"}
                            uri={uri}
                            columns={datasource.columns}
                            datasource={datasource.data}
                            tableProps={datasource.props_table}
                            OnClickAction={OnClickAction}
                            ActualizaTabla={ActualizaTabla}
                            loading={loading}
                            viewFab={false}
                        >
                            <FormAntdCrud formItems={datasource.formItems} />
                        </Crud>
                    </Grid>
                </Grid>
            </Box>
        </>
    )

}

export default Home;
