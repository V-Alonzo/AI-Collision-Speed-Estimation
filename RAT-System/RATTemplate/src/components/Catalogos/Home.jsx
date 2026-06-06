import React, { useState, useContext, useEffect } from 'react'
import { ConfigProvider } from 'antd';
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ThemeContext from '../../context/ThemContext'

import CrudContext from "../../context/crud/crudContext";
import { FormAntdCrud } from '../Global/FormComponent'
import Crud from "../Global/Crud";

import { useKeycloak } from "@react-keycloak/web";
import CatCatalogos from './Services'

import { Button, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';


const Home = (props) => {

  const { keycloak } = useKeycloak();
  const crudContext = useContext(CrudContext);
  const {
    datasource,
    form,
    loading,
    obtenerDatosAction,
    editarDatosAction,
    openModalCAction,
    chCurrentRowIDAction,
    chTitleBtnCAction,
  } = crudContext;

  const themeContext = useContext(ThemeContext)
  const { idiomaGral, msErrorApi, logoutOptions, colorIcon,  backgroundColor } = themeContext


  const [loadingComboCatalogos, setloadingComboCatalogos] = useState(false);
  const [formItemsCombo, setFormItemsCombo] = useState([]);
  const ComboCatalogos = async () => {
    setFormItemsCombo([])
    setloadingComboCatalogos(true)
    const response = await CatCatalogos(
      setloadingComboCatalogos,
      msErrorApi,
      keycloak,
      logoutOptions,
      "id",
    );
    //console.log("ComboCatalogos", response.formItems);
    setFormItemsCombo(response.formItems)
    setloadingComboCatalogos(false)
  };

  const [uri, setUri] = useState("configuracion/catalogs");

  useEffect(() => {
    ComboCatalogos();
    obtenerDatosAction(`${uri}/3`);
  }, []);

  const onChangeSelect = (value, event) => {
    setUri(`${uri}/${value}`)
    obtenerDatosAction(`${uri}/${value}`);
  };


  const swicthComponentAction = {
    Eliminar: (row) => onEliminarRow(row),
    Editar: (row) => onEditarRow(row),
  };

  //ACTION'S DE LAS TABLAS
  const OnClickAction = (row, key, event) => {
    swicthComponentAction[key](row, event);
  };

  const onEditarRow = (row) => {
    form.setFieldsValue(row);
    chCurrentRowIDAction(row[datasource.id])
    chTitleBtnCAction("Editar");
    openModalCAction();
  };

  const onEliminarRow = (row) => {

    editarDatosAction(uri, row, row[datasource.id], 'delete');
  };


  return (
    <>
      <ConfigProvider locale={idiomaGral}>

        <Box sx={{
          display: 'flex', flexWrap: 'wrap', '& > :not(style)':
            { m: 1, width: '98%', height: '100%', },
        }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>

              <Grid container spacing={1}>
                <Grid item xs={10}>
                  <FormAntdCrud formItems={formItemsCombo} onChangeSelect={onChangeSelect} loading={loadingComboCatalogos} />
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title="Actualizar Combo">
                    {/* <Button shape="circle" style={{ backgroundColor: backgroundColor }}
                       onClick={() =>   ComboCatalogos()}
                      icon={<SyncOutlined spin={loadingComboCatalogos}
                        style={{ fontSize: 15, color: colorIcon }}
                      />} /> */}

                      <Button
                      type="primary"
                      style={{ backgroundColor: backgroundColor }}
                      loading={loadingComboCatalogos}
                      onClick={() => ComboCatalogos()}
                      icon={<SyncOutlined
                        style={{ fontSize: 17, color: colorIcon }}
                      />}
                    />
                    
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Crud
                title={"Nuevo Registro......"}
                uri={uri}
                columns={datasource.columns}
                datasource={datasource.data}
                tableProps={datasource.props_table}
                OnClickAction={OnClickAction}
                ActualizaTabla={() => obtenerDatosAction(uri)}
                loading={loading}
                viewFab={false}
              >
                <FormAntdCrud formItems={datasource.formItems} />
              </Crud>
            </Grid>
          </Grid>

        </Box>

      </ConfigProvider>
    </>
  );
}

export default Home;
