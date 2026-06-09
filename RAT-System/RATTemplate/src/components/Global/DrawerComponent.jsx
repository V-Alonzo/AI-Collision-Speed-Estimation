import React, { useContext } from 'react';
import ThemeContext from '../../context/ThemContext'

import { ConfigProvider, Drawer } from 'antd';
import  '../../css/stylesDraw.css'

const DrawerAntd = (props) => {

  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext

  const { title, placement, visible, onClose , getContainer,style,width,closable} = props

  return (
    <ConfigProvider locale={idiomaGral}>
      <Drawer
        destroyOnHidden={true}
        title={title && title}
        placement={placement ? placement : "right"}
        onClose={onClose && onClose}
        open={visible}
        getContainer={getContainer}
        style={style}     
        width={width}  
        closable={closable}

      >
        {props.children}
      </Drawer>
    </ConfigProvider>)
};

export default DrawerAntd;