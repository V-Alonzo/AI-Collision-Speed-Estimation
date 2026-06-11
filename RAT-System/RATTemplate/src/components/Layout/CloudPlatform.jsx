import React, { useContext, useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

//CONTEX
import ThemeContext from "../../context/ThemContext";

//MUI
import Tooltip from "@mui/material/Tooltip";

//iconos
import { Icon } from "@iconify/react";

///menu puntitos
import Avatar from '@mui/joy/Avatar';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import MenuButton from '@mui/joy/MenuButton';
import Apps from '@mui/icons-material/Apps';
import Dropdown from '@mui/joy/Dropdown';
import { useNavigate } from "react-router-dom"

//servicios
import { ModulosPermissions } from "./Services";



const CloudPlatform = () => {
    const navigate = useNavigate()
    const { keycloak } = useKeycloak();
    const themeContext = useContext(ThemeContext);
    const { themeGral, msErrorApi, logoutOptions, setIId_Modulo, setModulo,id_Modulo } = themeContext;

    const abrirURL = (linkUrl,id_modulo,name) => {        
        // window.location.href = linkUrl
        navigate(linkUrl)
        setIId_Modulo(id_modulo) 
        setModulo(name)
    }


    /// FUNCION CUANDO 
    // const abrirURL = (linkUrl) => {
    //     // const linkUrl = 'https://appweb.cesvimexico.com.mx/Cdoce/#/';
    //     // window.open(linkUrl, '_blank');
    //     window.location.href = linkUrl
    // }


    const [loading, setloading] = useState(false);
    const [dataMod, setDataMod] = useState([]);
    const ModulosApi = async (keycloak) => {
        await keycloak.loadUserInfo()
        let id_keycloak = keycloak.userInfo.sub
        try {
            const response = await ModulosPermissions(
                setloading,
                msErrorApi,
                keycloak,
                logoutOptions,
                id_keycloak
            )
            // console.log("ModulosApi", response)

            switch (response.status) {
                case 403:
                    setloading(false);
                    break;

                case undefined:
                    setloading(false);
                    break;

                case 200:
                    setDataMod(response.modulos)
                    break;

                default:
                    break;
            }
        } catch (error) {
            setloading(false);
        }

    }

    useEffect(() => { if (!!keycloak.authenticated) {ModulosApi(keycloak)}}, [keycloak])


    return (
        <Dropdown>
            <Tooltip title="Apps">
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                    sx={{ borderRadius: 40, ml: 2 }}
                    style={{ right: 40, top: -3 }}
                    loading={loading}
                >
                    <Apps style={{ fontSize: themeGral.header_sizeIcon+4, color: themeGral.header_colorIcon, }} />
                </MenuButton>
            </Tooltip>
            <Menu
                variant="plain"  // plain -- soft --solid
                invertedColors
                aria-labelledby="apps-menu-demo"
                sx={{
                    '--List-padding': '0.5rem',
                    '--ListItemDecorator-size': '3rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 100px)',
                    gridAutoRows: '100px',
                    gap: 1,
                }}
            >
                {
                    dataMod.map((row, index) => (
                        <MenuItem orientation="vertical"
                            key={index}
                            onClick={() => abrirURL(row.url,row.id_modulo, row.name)}
                        >
                            <ListItemDecorator>
                                <Avatar
                                    size="lg"
                                    variant="plain"
                                >
                                    <Icon
                                        icon={row.icon}
                                        style={{ fontSize: themeGral.header_sizeIcon + 20 }}
                                    />
                                </Avatar>
                            </ListItemDecorator>
                            {row.title}
                        </MenuItem>
                    ))
                }
            </Menu>
        </Dropdown>
    )

}

export default CloudPlatform;