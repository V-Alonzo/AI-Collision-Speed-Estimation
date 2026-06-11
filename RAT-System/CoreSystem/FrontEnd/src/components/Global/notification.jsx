import React, { useEffect, useState } from 'react';
import { notification, message } from 'antd';

//MUI
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

//Documentacion ANTD
//type=> success || info || warning || error || warn || loading || open
//placement=> topLeft || topRight || bottomLeft || bottomRight 

const NotificationMessageANTD = (propsNM) => {

  const { type, texto, tipoComponent, placement, timepo, style } = propsNM

  {
    tipoComponent === 'notification' ?
      type !== 'loading' &&
      notification[type]({
        message: texto,
        placement: !placement ? 'topRight' : placement,
        duration: timepo > 0 ? timepo : 4.5,
        style: !style ? { top: 45 }  : style 

      })
      :
      message[type](texto, timepo > 0 ? timepo : 1);
  }
};


//Documentacion MUI
//type=> success || info || warning || error || 
//placement=> topLeft || topRight || bottomLeft || bottomRight 

export const NotificationMessageMUI = (props) => {

  const { stateSnackbar, setStateSnackbar } = props
  const { vertical, horizontal, open, message, type } = stateSnackbar;

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => setStateSnackbar({ ...stateSnackbar, open: false, })}
    >
      <Alert
        onClose={() => setStateSnackbar({ ...stateSnackbar, open: false, })}
        severity={type}
        sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar >
  )

};



export default NotificationMessageANTD;
