import React, { useContext } from 'react'
import ThemeContext from '../../context/ThemContext'

//MUI
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

//ANTD
import { ConfigProvider, Avatar as AvatarAntdInterno, } from 'antd';

//iCONOS
import { Icon } from '@iconify/react';

const AvatarMUIIcon = (props) => {

    //Destructuracion de props
    const { iconHijo, sizeHijo, altHijo, width, height, action, src, srcHijo, style } = props
    const themeContext = useContext(ThemeContext)
    const { themeGral, idiomaGral } = themeContext

    //Estilo de badge padre-hijo
    const SmallAvatar = styled(Avatar)(({ theme }) => ({
        width: sizeHijo,
        height: sizeHijo,
        backgroundColor: themeGral.componente_color,
        color: "white",
        border: `2px solid ${theme.palette.background.paper}`,
    }));

    return (
        <ConfigProvider locale={idiomaGral}>
            <Badge
                style={style}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                    <SmallAvatar alt={altHijo} onClick={() => action && action()}>
                        {srcHijo ?
                            <Avatar
                                alt={altHijo}
                                src={srcHijo}
                            //sx={{ width: width, height: height }}
                            /> :
                            <Icon icon={iconHijo} />
                        }
                    </SmallAvatar>
                }
            >
                <Avatar
                    alt={altHijo}
                    src={src}
                    sx={{ width: width, height: height }}
                />
            </Badge>
        </ConfigProvider>
    )
}

export const AvatarMUI = (props) => {
    //Destructuracion de props
    const { alt, width, height, src, arialabel, sx, style } = props

    const themeContext = useContext(ThemeContext)
    const { idiomaGral } = themeContext

    return (
        <ConfigProvider locale={idiomaGral}>
            <Avatar
                alt={alt && alt}
                src={src && src}
                width={width}
                height={height}
                aria-label={arialabel}
                sx={sx}  //width: 24, height: 24 
                style={style && style}
            />
        </ConfigProvider>
    )
}

export const AvatarANTD = (props) => {
    //Destructuracion de props
    const { alt, width, height, src } = props

    const themeContext = useContext(ThemeContext)
    const { idiomaGral } = themeContext

    return (
        <ConfigProvider locale={idiomaGral}>
            <AvatarAntdInterno
                alt={alt}
                src={src}
                width={width}
                height={height}
                size={{
                    xs: 24,
                    sm: 32,
                    md: 40,
                    lg: 64,
                    xl: 80,
                    xxl: 100,
                }}
            />
        </ConfigProvider>
    )
}


export default AvatarMUIIcon
