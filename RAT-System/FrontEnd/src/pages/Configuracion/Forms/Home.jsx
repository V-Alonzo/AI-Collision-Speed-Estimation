import React, { useState, useContext, useEffect } from "react";
import CrudContext from "../../../context/crud/crudContext";
import Crud from "../../../components/Global/Crud";
import ThemeContext from "../../../context/ThemContext";
import { useKeycloak } from "@react-keycloak/web";

import { FormAntdCrud } from "../../../components/Global/FormComponent";
import { ModdalANTD } from "../../../components/Global/ModalComponent";
import TablaANTD from "../../../components/Global/TablaComponent";
import DrawerAntd from "../../../components/Global/DrawerComponent";

//servicios
import { DetalleElementos, TableAtributtes, AddElementForm, DeleteElementForm, Combos, } from "./Services";

import { Button, } from "antd";
// import { Select } from "@mui/material";
import { Select } from "antd";

//MIU
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';


const Home = () => {
  const crudContext = useContext(CrudContext);
  const { datasource, form, loading, currentrowid, obtenerDatosAction, editarDatosAction,
    openModalCAction, chCurrentRowIDAction, chTitleBtnCAction, setLoadingCrud, } = crudContext;
  const themeContext = useContext(ThemeContext);
  const { msErrorApi, logoutOptions, } = themeContext;
  const { keycloak } = useKeycloak();
  const [uri] = useState("configuracion/forms");

  //TABLA
  useEffect(() => { ActualizaTabla(); }, []);

  const swicthComponentAction = {
    Eliminar: (row) => onEliminarRow(row),
    Editar: (row) => onEditarRow(row),
    Componetizar: (row) => DetalleComponentes(row),
    Input: (row, event) => onInputAttribute(row, event),

    //Elementos
    "Editar elemento": (row) => EditElement(row),
    "Eliminar elemento": (row) => onEliminarRowElemento(row),
  };

  const ActualizaTabla = () => {
    obtenerDatosAction(uri);
  };

  //ACTION'S DE LAS TABLAS
  const OnClickAction = (row, key, event) => {
    swicthComponentAction[key](row, event);
  };

  const onEditarRow = (row) => {
    form.setFieldsValue(row);
    chCurrentRowIDAction(row.forms_id);
    chTitleBtnCAction("Editar");
    openModalCAction();
  };

  const onEliminarRow = (row) => {
    row["status"] = "baja";
    editarDatosAction(uri, row, row.forms_id);
  };

  let newcomponent = [];
  const [newcomponentHook, setNewcomponentHook] = useState([]);
  const onInputAttribute = (row, event, value) => {
    let attribute = {
      element_id: row.element_id,
      attribute_id: row.attribute_id,
      value: event ? event.target.value : value,
      type: "form",
    };
    if (validarNewComponnet(attribute)) {
      newcomponent = newcomponent.filter(
        (comp) => comp.attribute_id !== attribute.attribute_id
      );
    }
    newcomponent.push(attribute);
  };

  const validarNewComponnet = (attribute) => {
    let aux = newcomponent.find(
      (comp) => comp.attribute_id === attribute.attribute_id
    );
    if (aux !== undefined) {
      return true;
    }
    return false;
  };

  //modal action
  const [visible, setVisible] = useState(false);
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  //detalle
  const [datasourceDetalle, setDataSourceDetalle] = useState([]);
  const [columnsDetalle, setColumnsDetalle] = useState([]);
  const [loadingDetalle, setloadingDetalle] = useState(false);
  const [tablePropsDetalle, setTablePropsDetalle] = useState([]);
  const [formPropsDetalle, setFormTablePropsDetalle] = useState([]);

  const [rowForms, setRowForms] = useState([]);
  const DetalleComponentes = async (row) => {
    setLoadingCrud(true);

    const response = await DetalleElementos(
      setloadingDetalle,
      msErrorApi,
      keycloak,
      logoutOptions,
      row.forms_id
    );

    setDataSourceDetalle(response.data);
    setColumnsDetalle(response.columns);
    setTablePropsDetalle(response.props_table);
    setFormTablePropsDetalle(response.formItems);

    ////console.log("DetalleComponentes", response);

    setRowForms(row);
    chCurrentRowIDAction(row.forms_id);
    setVisible(true);
    setLoadingCrud(false);
    setVisibleDrawer(false);
  };

  const [colmnsattributes, setColumnsAttributes] = useState([]);
  const [datasourceattributes, setDataSourceAttributes] = useState([]);

  const TablaAtributos = async (id, dfi) => {
    setlLoadingAtributos(true);
    const response = await TableAtributtes(
      setloadingDetalle,
      msErrorApi,
      keycloak,
      logoutOptions,
      id,
      dfi
    );

    ////console.log("TablaAtributos", response);
    setDataSourceAttributes(response.data);
    setColumnsAttributes(response.columns);

    // EDITA ARREGLO PARA MODIFICAR DE
    response.data.forEach((row) => {
      onInputAttribute(row, undefined, row.defaultValue);
    });
    setNewcomponentHook(newcomponent);
    ////console.log("newcomponent", newcomponent)

    setlLoadingAtributos(false);
  };

  const addElementForm = async () => {
    let newcomponentFin = [...newcomponentHook];
    newcomponent.forEach((row) => {
      let attribute = {
        element_id: row.element_id,
        attribute_id: row.attribute_id,
        value: row.value,
        type: "form",
      };
      if (validarNewComponnet(attribute)) {
        newcomponentFin = newcomponentFin.filter(
          (comp) => comp.attribute_id !== attribute.attribute_id
        );
      }
      newcomponentFin.push(attribute);
    });

    let parameters = {
      form_id: currentrowid,
      component_no: componentNo,
      component: newcomponentFin,
    };

    ////console.log("parameters", parameters);
    await AddElementForm(
      setloadingDetalle,
      msErrorApi,
      keycloak,
      logoutOptions,
      parameters,
      editElementBandT === "edit" && "put"
    );

    DetalleComponentes(rowForms);
    setVisibleDrawer(false);
  };

  const [loadingAdd, setlLoadingAdd] = useState(false);
  const NewElement = () => {
    setEditElementBand(false);
    setDataSourceAttributes([]);
    setColumnsAttributes([]);
    setlLoadingAdd(true);
    setVisibleDrawer(true);
    setlLoadingAdd(false);
  };

  const [selectform, setSelectForm] = useState(false);
  const [parent, setParent] = useState(null);
  const [reutilizable, setReutilizable] = useState();
  const [combos, setCombos] = useState([]);

  const CombosSelect = async () => {
    setLoadingCrud(true);

    const response = await Combos(
      setloadingDetalle,
      msErrorApi,
      keycloak,
      logoutOptions
    );
    setCombos(response.data);
  };

  const [loadingAtributos, setlLoadingAtributos] = useState(false);
  const onChangeSelect = (value, event, key) => {
    newcomponent = [];
    setNewcomponentHook([]);
    setEditElementBandT("add");
    TablaAtributos(value, 0);
    if (value === 8) {
      CombosSelect();
      setSelectForm(true);
    } else {
      setSelectForm(false);
    }
  };

  const onEliminarRowElemento = async (row) => {
    await DeleteElementForm(
      setLoadingCrud,
      msErrorApi,
      keycloak,
      logoutOptions,
      row.data_form_id
    );

    DetalleComponentes(rowForms);
  };

  const [editElementBand, setEditElementBand] = useState("");
  const [editElementBandT, setEditElementBandT] = useState("add");
  const [componentNo, setComponentNo] = useState(0);

  const EditElement = (row) => {
    setEditElementBandT("edit");
    setComponentNo(row.component_no);
    setEditElementBand(row.name_element);
    TablaAtributos(row.element_id, row.component_no);

    setlLoadingAdd(true);
    setVisibleDrawer(true);
    setlLoadingAdd(false);
  };

  const onSelectFormCombo = (value) => {
    let attribute = {
      element_id: 8,
      attribute_id: 23,
      value: value,
      type: "form",
    };
    if (validarNewComponnet(attribute)) {
      newcomponent = newcomponent.filter(
        (comp) => comp.attribute_id !== attribute.attribute_id
      );
    }
    newcomponent.push(attribute)
    //console.log(newcomponent);
  };

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
          setDataSource={setDataSourceDetalle}
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
          dragSorting={tablePropsDetalle && tablePropsDetalle.dragSorting}
          Title={rowForms.name_form}
          IconAvatar={tablePropsDetalle && tablePropsDetalle.IconAvatar}
          OnClickAction={OnClickAction}
          ActualizaTabla={() => DetalleComponentes(rowForms)}
          Agregar={() => NewElement()}
          AgregarIcon={tablePropsDetalle && tablePropsDetalle.IconAgregar}
        >
          <DrawerAntd
            title={!editElementBand ? " Nuevo Elemento" : editElementBand}
            onClose={() => setVisibleDrawer(false)}
            visible={visibleDrawer}
            getContainer={false}
            style={{ position: "absolute" }}
          >
            {!editElementBand && (
              <FormAntdCrud
                formItems={formPropsDetalle}
                onChangeSelect={onChangeSelect}
              />
            )}

            <TablaANTD
              tbSimple={true}
              loading={loadingAtributos}
              columnsTable={colmnsattributes}
              datasource={datasourceattributes}
              setDataSource={setDataSourceDetalle}
              pagination={tablePropsDetalle && tablePropsDetalle.pagination}
              pageSize={tablePropsDetalle && tablePropsDetalle.pageSize}
              simplepage={tablePropsDetalle && tablePropsDetalle.simplepage}
              positionBottom={
                tablePropsDetalle && tablePropsDetalle.positionBottom
              }
              positionTop={tablePropsDetalle && tablePropsDetalle.positionTop}
              size={tablePropsDetalle && tablePropsDetalle.size}
              bordered={tablePropsDetalle && tablePropsDetalle.bordered}
              scrollX={tablePropsDetalle && tablePropsDetalle.scrollX}
              scrollY={tablePropsDetalle && tablePropsDetalle.scrollY}
              tableLayout={tablePropsDetalle && tablePropsDetalle.tableLayout}
              dragSorting={tablePropsDetalle && tablePropsDetalle.dragSorting}
              OnClickAction={OnClickAction}
            />

            {selectform && (
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Selecciona el combo para relacionar"
                  optionFilterProp="children"
                  onChange={onSelectFormCombo}              
                  style={{ width: "100%" }}
                  options={combos}
                />
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <Button
                loading={loadingDetalle}
                type="primary"
                onClick={() => addElementForm()}
              >
                {!editElementBand
                  ? "  Agregar elemento"
                  : "  Modificar elemento"}
              </Button>
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
              title={"Nuevo Forms"}
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
  );
};

export default Home;
