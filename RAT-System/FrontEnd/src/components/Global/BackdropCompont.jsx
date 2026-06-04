import React ,{useContext} from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import ThemeContext from '../../context/ThemContext'

const BackdropMUI = (props) => {

     // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  // const { themeGral } = themeContext  setOpen

    const { open,  handleClose } = props;

  return (
    <>    
      <Backdrop
        sx={{            
           // backgroundColor :backgroundColor ,             
            zIndex: (theme) => theme.zIndex.drawer + 1 
        }}
        open={open}
        onClick={ ()=>handleClose && handleClose()}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default BackdropMUI;