import React, { useContext, useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";

//ANTD
import { Layout as AntLayout } from "antd";

//CONTEX
import ThemeContext from "../../context/ThemContext";
import UserContext from "../../context/UserContext";

//MUI
import Box from "@mui/material/Box";
import MenuB from "@mui/material/Menu";
import MenuItemB from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from '@mui/joy/IconButton';

//iconos
import { Icon } from "@iconify/react";
import bellOutline from "@iconify/icons-mdi/bell-outline";

//componentes
import { AvatarMUI } from "../Global/AvatarComponent";
import BadgeMUIImg from "../Global/BadgeComponent";
import CloudPlatform from './CloudPlatform'
import CardColaborador from "../Global/Colaborador/CardColaborador";

//servicios
import { DataOneUser } from "./Services";

const { Header } = AntLayout;

const HeaderComponent = () => {
  let navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const userContext = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const themeContext = useContext(ThemeContext);
  const [loading, setloading] = useState(false);

  const {
    themeGral,
    setThemeGral,
    setThemeAntd,

    colorBadge,
    setColorBadge,
    setPrimaryColor,
    setSecondaryColor,

    msErrorApi,
    logoutOptions,

    id_Modulo,
    Modulo,
  } = themeContext;

  const { user, updateUser } = userContext;

  useEffect(() => {
    if (!!keycloak.authenticated) {
      DatosPerfil(keycloak)
    }
  }, [keycloak]);


  const DatosPerfil = async (keycloak) => {
    await keycloak.loadUserInfo()
    let user_info = keycloak.userInfo
    const response = await DataOneUser(
      setloading,
      msErrorApi,
      keycloak,
      logoutOptions,
      user_info.sub
    );

    updateUser({
      ...response[0],
      path_foto:response[0].path_foto,
      code_activacion:response[0].code_activacion,
      id_modulo: process.env.REACT_APP_Modulo,
      id_keycloak: user_info.sub,
      preferred_username: user_info.preferred_username,
      email: user_info.email,
      given_name: user_info.given_name,
      family_name: user_info.family_name,
      name: user_info.name,
      id_company: response[0].id_company,
      company: response[0].company,
      rol: keycloak.resourceAccess ? keycloak.resourceAccess[process.env.REACT_APP_clientId].roles[0] : null
    });

    setThemeGral({
      header_color: response[0].primary_color,
      header_color_text: response[0].text_color_primario,
      header_colorIcon: response[0].secondary_color,
      header_colorIconMenu: response[0].secondary_color,
      header_sizeIcon: response[0].header_sizeIcon,
      footer_color: response[0].primary_color,
      footer_colorText: response[0].text_color_primario,
      Layout_themeAntd: response[0].Layout_themeAntd,
      Layout_colorIcon: response[0].secondary_color,
      Layout_sizeIcon: response[0].Layout_sizeIcon,
      Layout_colorIconChildre: response[0].secondary_color,
      Layout_sizeIconChildre: response[0].Layout_sizeIconChildre,
      table_color: response[0].secondary_color,
      table_colorIcon: response[0].table_colorIcon,
      table_sizeIcon: response[0].table_sizeIcon,
      action_colorIcon: response[0].action_colorIcon,
      action_sizeIcon: response[0].action_sizeIcon,
      icono: response[0].icono,
      logo: response[0].logo,
      primary_color: response[0].primary_color,
      secondary_color: response[0].secondary_color,
      text_color_primario: response[0].text_color_primario,
      text_color_secundario: response[0].text_color_secundario,

      componente_color: response[0].secondary_color,
      componente_colorIcon: response[0].secondary_color,
      componente_sizeIcon: response[0].componente_sizeIcon,

      // header_color: response[0].header_color,
      // header_color_text: response[0].header_color_text,
      // header_colorIcon: response[0].header_colorIcon,
      // header_colorIconMenu: response[0].header_colorIconMenu,
      // header_sizeIcon: response[0].header_sizeIcon,
      // footer_color: response[0].footer_color,
      // footer_colorText: response[0].footer_colorText,
      // Layout_themeAntd: response[0].Layout_themeAntd,
      // Layout_colorIcon: response[0].Layout_colorIcon,
      // Layout_sizeIcon: response[0].Layout_sizeIcon,
      // Layout_colorIconChildre: response[0].Layout_colorIconChildre,
      // Layout_sizeIconChildre: response[0].Layout_sizeIconChildre,
      // table_color: response[0].table_color,
      // table_colorIcon: response[0].table_colorIcon,
      // table_sizeIcon: response[0].table_sizeIcon,
      // action_colorIcon: response[0].action_colorIcon,
      // action_sizeIcon: response[0].action_sizeIcon,

      // componente_color: response[0].componente_color,
      // componente_colorIcon: response[0].componente_colorIcon,
      // componente_sizeIcon: response[0].componente_sizeIcon,

    })

    setColorBadge(response[0].color_badge)
    setPrimaryColor(response[0].primary_color)
    setSecondaryColor(response[0].secondary_color)
    setThemeAntd(response[0].Layout_themeAntd)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const swicthTipo = {
    Login: () => {
      keycloak.login(process.env.REACT_APP_logoutOption);
    },
    Salir: () => {
      keycloak.logout(process.env.REACT_APP_logoutOption);
    },
  };

  const handleSalir = (event, tipo) => {
    setAnchorEl(event.currentTarget);
    swicthTipo[tipo]();
  };
 

  

  return (
    <Header
      className="site-layout-background"
      style={{
        textAlign: "right",
        background: themeGral.header_color,
      }}
    >
   
      <Typography
        variant="h6"
        
        color={themeGral.header_color_text}
        style={{ top: 15, position: "relative", float: "left" }}
      >
        {Modulo} 
      </Typography>

      <Box sx={{ position: "relative", float: "right", mt: 1 }}>
        <Tooltip title="Configuraciones de la cuenta">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            // style={{ right: -100 }}
            style={{ right: -75 }}
          >
            <AvatarMUI
              alt="NameUser"
              // src={process.env.REACT_APP_BASE_URL+"SIC_Empleado_Fotos/" + user.cve_empleado + ".JPG"}
              //src={user.path_foto}


            />
          </IconButton>
        </Tooltip>
     
        <CloudPlatform />
      </Box>
      <MenuB
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            // '& .MuiAvatar-root': {
            //     width: 32,
            //     height: 32,
            //     ml: -0.5,
            //     mr: 1,
            // },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 17,
              width: 15,
              height: 15,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <CardColaborador user={user} />
        </Box>
        <Divider />  <Divider />

        <MenuItemB>
          <ListItemIcon>
            <Icon
              icon={"mdi:card-account-details-star-outline"}
              style={{ fontSize: themeGral.header_sizeIcon, color: themeGral.header_colorIconMenu }}
            />
          </ListItemIcon>
          <Typography variant="caption" display="block" gutterBottom>
            Portafolio
          </Typography>
        </MenuItemB>
        <MenuItemB>
          <ListItemIcon>
            <Icon
              icon={"material-symbols:settings-account-box-outline-rounded"}
              style={{ fontSize: themeGral.header_sizeIcon, color: themeGral.header_colorIconMenu }}
            />
          </ListItemIcon>
          <Typography variant="caption" display="block" gutterBottom>
            Configuracion
          </Typography>
        </MenuItemB>

        {!keycloak.authenticated && (
          <MenuItemB onClick={(event) => handleSalir(event, "Login")}>
            <ListItemIcon>
              <Icon
                icon={"uil:exit"}
                style={{ fontSize: themeGral.header_sizeIcon, color: themeGral.header_colorIconMenu }}
              />
            </ListItemIcon>
            <Typography variant="caption" display="block" gutterBottom>
              Login
            </Typography>
          </MenuItemB>
        )}

        {!!keycloak.authenticated && (
          <MenuItemB onClick={(event) => handleSalir(event, "Salir")}>
            <ListItemIcon>
              <Icon
                icon={"uil:exit"}
                style={{ fontSize: themeGral.header_sizeIcon, color: themeGral.header_colorIconMenu }}
              />
            </ListItemIcon>
            <Typography variant="caption" display="block" gutterBottom>
              Salir
            </Typography>
          </MenuItemB>
        )}
      </MenuB>
    </Header>
  );
};

export default HeaderComponent;
