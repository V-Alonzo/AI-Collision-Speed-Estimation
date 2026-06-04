import React, { useState, createContext } from 'react'
import { green, red, } from '@mui/material/colors';

import es_ES from 'antd/locale/es_ES';
import { icon } from 'leaflet';

const ThemeContext = createContext();
export const ThemeConsumer = ThemeContext.Consumer;

export const ThemeProvider = (props) => {

    //Generales 
    const [themeGral, setThemeGral] = useState({
        header_color: "#929292",
        header_color_text: "#FFFFFF",
        header_colorIcon: "#FFFFFF",
        header_colorIconMenu: "#009AD4",
        header_sizeIcon: 25,
        footer_color: "#f5f5f5",
        footer_colorText: "#929292",
        Layout_themeAntd: "light",
        Layout_colorIcon: "#009AD4",
        Layout_sizeIcon: 25,
        Layout_colorIconChildre: "#929292",
        Layout_sizeIconChildre: 25,
        table_color: "#929292",
        table_colorIcon: "#FFFFFF",
        table_sizeIcon: 25,
        action_colorIcon: "#929292",
        action_sizeIcon: 25,

        componente_color: "#929292",
        componente_colorIcon: "#929292",
        componente_sizeIcon: 25,
        icono: "icono_cesvi",
        logo: "logo_cesvi",
    })


    //Badge
    const [colorBadge, setColorBadge] = useState(green[500])

    /// Tipos Generales
    const [primaryColor, setPrimaryColor] = useState(red)
    const [secondaryColor, setSecondaryColor] = useState(green)

    //Layout
    const [themeAntd, setThemeAntd] = useState('light') //light--dark

    ///mensaje erro genericos
    const [msErrorApi, setMsErrorApi] = useState("ERROR en el API")

    //IDIOMA
    const [idiomaGral, setIdiomaGral] = useState(es_ES)
    const [logoutOptions, setLogoutOptions] = useState('http://localhost:3000/#/')

//MODULOS
const [Modulo, setModulo] = useState("Dashboard")
const [id_Modulo, setIId_Modulo] = useState(1)


    return (
        <ThemeContext.Provider
            value={{
                themeGral,
                primaryColor,
                secondaryColor,
                themeAntd,
                colorBadge,
                msErrorApi,
                idiomaGral,
                logoutOptions,
                id_Modulo,
                Modulo,

                setThemeGral,
                setColorBadge,
                setPrimaryColor,
                setSecondaryColor,
                setThemeAntd,
                setMsErrorApi,
                setIdiomaGral,
                setIId_Modulo,
                setModulo,
            }}
        >
            {props.children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext
