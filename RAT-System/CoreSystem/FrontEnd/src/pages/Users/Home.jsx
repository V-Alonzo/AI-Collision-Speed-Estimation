import React, { useState, useContext, useEffect } from "react";
import ThemeContext from "../../context/ThemContext";
import { useKeycloak } from "@react-keycloak/web";

//components
import TablaANTD from "../../components/Global/TablaComponent";
import { ModdalANTD } from "../../components/Global/ModalComponent";
import FormAntd from "../../components/Global/FormComponent";
import DrawerAntd from "../../components/Global/DrawerComponent";

//servicios
import DataUser, { UpdateElement, MenuPermissions, UpdatePermissions } from "./Services";

//MIU
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';


//MIU/joy
import { StyledEngineProvider, CssVarsProvider } from '@mui/joy/styles';
import List from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Sheet, { sheetClasses } from '@mui/joy/Sheet';
import Switch, { switchClasses } from '@mui/joy/Switch';

//ANTD
import { Form } from "antd";

//iconos 
import { Icon } from '@iconify/react';
import { Uid } from '../../components/Global/funciones'

import { Select } from 'antd';


const Home = () => {

  const themeContext = useContext(ThemeContext);
  const { keycloak } = useKeycloak();

  const { themeGral, msErrorApi, logoutOptions, } = themeContext;

  //hooks table

  const [datasource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setloading] = useState(false);
  const [tableProps, setTableProps] = useState([]);
  const [formItems, setFormItems] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [catalogoData, setCatalogoData] = useState([]);


  //modal action
  const [visible, setVisible] = useState(false);
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  const [id_user, setId_user] = useState("");
  const [id_modulo, setId_modulo] = useState(0);



  //TABLA
  useEffect(() => { ActualizaTabla() }, []);

   //ACTION'S DE LAS TABLAS
  const OnClickAction = (row, key) => { swicthComponentAction[key](row) };
  
  const swicthComponentAction = {
    // Eliminar: (row) => onEliminarRow(row),
    Editar: (row) => onEditarRow(row),
    Permisos: (row) => NewPermission(row),
  };

  const ActualizaTabla = async () => {
    try {
      const response = await DataUser(
        setloading,
        msErrorApi,
        keycloak,
        logoutOptions,
      )
      switch (response.status) {
        case 403:
          setloading(false);
          break;

        case undefined:
          setloading(false);
          break;

        case 200:
          console.log("USUARIOS", response.data);

          setDataSource(response.data)
          setColumns(response.columns)
          setTableProps(response.props_table)
          setFormItems(response.formItems)
          setCatalogoData(response.catalogo)

          break;

        default:
          break;
      }
    } catch (error) {
      setloading(false);
    }

  };

 

  const [form] = Form.useForm();
  const onEditarRow = (row) => {
    //console.log("onEditarRow", row)

    form.resetFields()
    form.setFieldsValue(row);

    setId_user(row.id_user)
    setVisible(true)

  };



  const onFinish = async (value) => {
    setloading(true);
    try {
      const response = await UpdateElement(
        setloading,
        msErrorApi,
        keycloak,
        logoutOptions,
        id_user,
        value
      )
      switch (response.status) {
        case 403:
          setloading(false);
          break;

        case undefined:
          setloading(false);
          break;

        case 200:
          ActualizaTabla()
          setVisible(false)
          setId_user("")
          form.resetFields()
          break;

        default:
          break;
      }
    } catch (error) {
      setloading(false);
    }

  };

 
  const onPersmiosRow = async (value) => {
    setId_modulo(value)
    try {
      const response = await MenuPermissions(
        setloadingModulo,
        msErrorApi,
        keycloak,
        logoutOptions,
        rowData.id_keycloak,
        {
          keycloak_id: rowData.id_keycloak,
          cve_empleado: rowData.cve_empleado,
          id_modulo: value,
        }

      )
      ////console.log("VerMenuPermissions", response)

      switch (response.status) {
        case 403:
          setloadingModulo(false);
          break;
        case undefined:
          setloadingModulo(false);
          break;
        case 200:
          setMenuData(response.menu)
          setVisibleDrawer(true)
          break;

        default:
          break;
      }
    } catch (error) {
      setloadingModulo(false);
    }

  }

  const [loadingChecked, setloadingChecked] = useState(false);
  const onChangeChecked = async (value, row) => {
    let request = ""
    let uri = ""
    switch (value) {
      case true:
        request = 'post'
        uri = '/user/permisos'

        break;
      case false:
        request = 'delete'
        uri = `/user/permisos/${row.permission_id}`
        break;

      default:
        break;
    }
    try {
      const response = await UpdatePermissions(
        setloadingChecked,
        msErrorApi,
        keycloak,
        logoutOptions,
        uri,
        request,
        {
          keycloak_id: rowData.id_keycloak,
          menu_id: row.menu_id,
          user_id: rowData.cve_empleado,
          id_modulo: id_modulo,
        }
      )
      ////console.log("onChangeChecked", response)
      switch (response.status) {
        case 403:
          setloadingChecked(false);
          break;

        case undefined:
          setloadingChecked(false);
          break;

        case 200:
          onPersmiosRow(id_modulo)
          break;

        default:
          break;
      }
    } catch (error) {
      setloadingChecked(false);
    }

  };


  const onChange = (value) => { onPersmiosRow(value) };
  const onSearch = (value) => { onPersmiosRow(value) };
  const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const [loadingModulo, setloadingModulo] = useState(false);
  const [rowData, setRowData] = useState([]);

  const NewPermission = (rowSelect) => {
    setMenuData([])
    setRowData(rowSelect)
    setVisibleDrawer(true)
  }


  return (
    <>

      <ModdalANTD
        visible={visible}
        title={"Modificar Usuario"}
        footer={false}
        onCancel={() => setVisible(false)}
        width={"45%"}
        centered
      >
        <FormAntd
          salto={false}
          xs={12}
          sm={12}
          md={12}
          xsBotton={12}
          smBotton={12}
          mdBotton={12}

          layout={"vertical"}
          loading={loading}
          formItems={formItems}
          form={form}
          onFinish={onFinish}
          titleSubmit={"Editar"}
          iconButton={"material-symbols:save-as-outline"}
        />
      </ModdalANTD>


      <DrawerAntd
        title={"Permisos del usuario"}
        onClose={() => setVisibleDrawer(false)}
        visible={visibleDrawer}
      >

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Select
              loading={loadingModulo}
              showSearch
              placeholder="Selecione Modulo"
              optionFilterProp="children"
              onChange={onChange}
              onSearch={onSearch}
              filterOption={filterOption}
              options={catalogoData}
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={12} /><br /><br />

        </Grid>

        <StyledEngineProvider injectFirst>
          <CssVarsProvider>
            <List             
              aria-labelledby="ios-example-demo"
              sx={(theme) => ({
                '& ul': {
                  '--List-gap': '0px',
                  bgcolor: 'background.surface',
                  '& > li:first-child > [role="button"]': {
                    borderTopRightRadius: 'var(--List-radius)',
                    borderTopLeftRadius: 'var(--List-radius)',
                  },
                  '& > li:last-child > [role="button"]': {
                    borderBottomRightRadius: 'var(--List-radius)',
                    borderBottomLeftRadius: 'var(--List-radius)',
                  },
                },
                '--List-radius': '8px',
                '--List-gap': '1rem',
                '--List-divider-gap': '0px',
                '--List-item-paddingY': '0.5rem',
                // override global variant tokens
                '--joy-palette-neutral-plainHoverBg': 'rgba(0 0 0 / 0.08)',
                '--joy-palette-neutral-plainActiveBg': 'rgba(0 0 0 / 0.12)',
                [theme.getColorSchemeSelector('light')]: {
                  '--joy-palette-divider': 'rgba(0 0 0 / 0.08)',
                },
                [theme.getColorSchemeSelector('dark')]: {
                  '--joy-palette-neutral-plainHoverBg': 'rgba(255 255 255 / 0.1)',
                  '--joy-palette-neutral-plainActiveBg': 'rgba(255 255 255 / 0.16)',
                },
              })}
            >

              <ListItem nested>
                <List
                  aria-label="Network"
                  sx={{
                    [`& .${sheetClasses.root}`]: {
                      p: 0.5,
                      lineHeight: 0,
                      borderRadius: 'sm',
                    },
                  }}
                >

                  {menuData.map((row, index) => (
                    <>
                      <ListItem key={Uid(index)}>
                        <ListItemDecorator key={Uid(index)}>
                          <Sheet key={Uid(index)} variant="solid" style={{ background: themeGral.table_color }}>
                            <Icon key={Uid(index)} icon={row.icon} style={{ fontSize: themeGral.table_sizeIcon }} />
                          </Sheet>
                        </ListItemDecorator>
                        <ListItemContent key={Uid(index)} htmlFor="airplane-mode" component="label">
                          {row.ruta_route}
                        </ListItemContent>
                        <Switch
                          key={Uid(index)}
                          defaultChecked={row.checked}
                          onChange={(event) => onChangeChecked(event.target.checked, row)}
                          id="airplane-mode"
                          size="lg"
                          color="primary"
                          sx={(theme) => ({
                            '--Switch-thumb-shadow': '0 3px 7px 0 rgba(0 0 0 / 0.12)',
                            '--Switch-thumb-size': '27px',
                            '--Switch-track-width': '51px',
                            '--Switch-track-height': '31px',
                            '--Switch-track-background': theme.vars.palette.background.level3,
                            [`& .${switchClasses.thumb}`]: {
                              transition: 'width 0.2s, left 0.2s',
                            },
                            '&:hover': {
                              '--Switch-track-background':
                                theme.vars.palette.background.level3,
                            },
                            '&:active': {
                              '--Switch-thumb-width': '32px',
                            },
                            [`&.${switchClasses.checked}`]: {
                              '--Switch-track-background': 'rgb(48 209 88)',
                              '&:hover': {
                                '--Switch-track-background': 'rgb(48 209 88)',
                              },
                            },
                          })}
                        />
                      </ListItem>
                      <ListDivider key={Uid(index)} inset="startContent" />
                    </>
                  )
                  )}

                </List>
              </ListItem>
            </List>


          </CssVarsProvider>
        </StyledEngineProvider>

      </DrawerAntd>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          '& > :not(style)': { m: 1, width: '96%', height: '100%', },
        }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TablaANTD
              loading={loading}
              columnsTable={columns}
              datasource={datasource}

              setDataSource={setDataSource}
              pagination={tableProps && tableProps.pagination}
              pageSize={tableProps && tableProps.pageSize}
              simplepage={tableProps && tableProps.simplepage}
              positionBottom={tableProps && tableProps.positionBottom}
              positionTop={tableProps && tableProps.positionTop}
              size={tableProps && tableProps.size}
              bordered={tableProps && tableProps.bordered}
              scrollX={tableProps && tableProps.scrollX}
              scrollY={tableProps && tableProps.scrollY}
              tableLayout={tableProps && tableProps.tableLayout}
              dragSorting={tableProps && tableProps.dragSorting}
              Title={tableProps.Title}
              IconAvatar={tableProps && tableProps.IconAvatar}

              OnClickAction={OnClickAction}
              ActualizaTabla={() => ActualizaTabla()}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Home;
