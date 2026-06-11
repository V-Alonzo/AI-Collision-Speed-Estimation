import React, { useContext, useState, useEffect } from "react";

//MUI
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { blue } from '@mui/material/colors';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';



// size-->'small'| 'medium'| 'large'| 

const ButtonMUIE = (props) => {
  //Destructuracion de props
  const { text, action, colorTipe, loading, startIcon, endIcon, size, fullWidth } = props;

  const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(colorTipe ? colorTipe[500] : blue[500]),
    backgroundColor: colorTipe ? colorTipe[500] : blue[500],
    '&:hover': {
      backgroundColor: colorTipe ? colorTipe[700] : blue[700],
    },
  }));

  return (
    <>

      <ColorButton
        fullWidth={fullWidth && fullWidth}
        size={size && size}
        disabled={loading}
        onClick={() => action && action()}
        startIcon={startIcon && startIcon}
        endIcon={endIcon && endIcon}
      >{text}
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: colorTipe[900],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </ColorButton>
    </>
  );
}

export const ButtonMUIS = (props) => {

  //Destructuracion de props
  const { text, action, colorTipe, loading, startIcon, endIcon, size, fullWidth } = props;

  const BootstrapButton = styled(Button)({
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
    padding: '6px 12px',
    border: '1px solid',
    lineHeight: 1.5,
    backgroundColor: colorTipe ? colorTipe[500] : blue[500],
    borderColor: colorTipe ? colorTipe[600] : blue[600],
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: colorTipe ? colorTipe[600] : blue[600],
      borderColor: colorTipe ? colorTipe[700] : blue[700],
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: colorTipe ? colorTipe[700] : blue[700],
      borderColor: colorTipe ? colorTipe[800] : blue[800],
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem ' + (colorTipe ? colorTipe[600] : blue[600]),
    },
  });

  return (
    <BootstrapButton
      fullWidth={fullWidth && fullWidth}
      size={size && size}
      disabled={loading}
      variant="contained"
      disableRipple
      onClick={() => action && action()}
      startIcon={startIcon && startIcon}
      endIcon={endIcon && endIcon}
    >{text}
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            color: colorTipe[900],
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
    </BootstrapButton>
  );

}


export const IconButtonMUI = (props) => {

  const { children, onclickIconButton, size } = props;

  return (
    <IconButton
      size={size}
      onClick={() => onclickIconButton()}
    >
      {children}
    </IconButton>
  )
}


export default ButtonMUIE;




