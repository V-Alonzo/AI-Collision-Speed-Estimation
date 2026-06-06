import React, { useContext } from 'react'
import ThemeContext from '../../context/ThemContext'

//MUI
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

//iconos 
import { Icon } from '@iconify/react';

//IDIOMA
import { ConfigProvider } from 'antd';


const BadgeMUIImg = (props) => {
  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext

  const { icon, badgeContent, max, sizeIcon, colorIcon, colorBadge, } = props

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -2,
      top: 0,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
      backgroundColor: colorBadge,
      color: "white"
    },
  }));

  return (
    <ConfigProvider locale={idiomaGral}>
      <StyledBadge badgeContent={badgeContent} max={max} >
        <Icon icon={icon} style={{ fontSize: sizeIcon, color: colorIcon }} />
      </StyledBadge>
    </ConfigProvider>
  )
}

export default BadgeMUIImg;