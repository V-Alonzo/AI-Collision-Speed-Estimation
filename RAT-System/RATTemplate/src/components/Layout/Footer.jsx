import React, { useContext } from 'react'
import { Layout as AntLayout } from 'antd'
import ThemeContext from '../../context/ThemContext'
import Typography from '@mui/material/Typography';

const { Footer } = AntLayout

const FooterComponent = () => {
    const themeContext = useContext(ThemeContext)
    const { themeGral } = themeContext
    let today = new Date();
    let year = today.getFullYear()
    return (
        <Footer
            style={{
                textAlign: 'center',
                background: themeGral.footer_color
            }}
        >           
            <Typography variant="h7"  color={themeGral.footer_colorText} >©{year} Creado por CESVI MÉXICO</Typography> 

        </Footer>
    )
}

export default FooterComponent
