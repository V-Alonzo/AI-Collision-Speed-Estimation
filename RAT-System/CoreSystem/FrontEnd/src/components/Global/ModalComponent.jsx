import React, { useState, useContext, } from "react";
import ThemeContext from '../../context/ThemContext'

//MUI
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { ConfigProvider, Form, Modal } from "antd";

const ModdalMUI = (props) => {
  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext
  const { open, closeModal, footer, title, maxWidth } = props;

  const [form] = Form.useForm()

  const [btntitle, setBtnTitle] = useState("Guardar")

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))

  const onFinish = (values) => {
    console.log(values)
  };


  return (
    <>
      <ConfigProvider locale={idiomaGral}>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={closeModal}
          aria-labelledby="responsive-dialog-title"
          fullWidth={true}
          maxWidth={maxWidth ? maxWidth : "sm"}  //sm-md-lg
          BackdropProps={{
            sx: {
              backgroundColor: "rgba(111, 126, 140, 0.2)",
              backdropFilter: "blur(4px)"
            }
          }}
        >
          <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
          <Form form={form} name="control-hooks" onFinish={onFinish}>
            <DialogContent>{props.children}</DialogContent>
            {
              footer &&
              <DialogActions>
                <Button autoFocus onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" autoFocus>
                  {btntitle}
                </Button>
              </DialogActions>
            }
          </Form>
        </Dialog>
      </ConfigProvider>
    </>
  );
};


export const ModdalANTD = (props) => {

  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext

  const { visible, title, footer, onCancel, width, height, centered, style } = props;

  return (
    <>
      <ConfigProvider locale={idiomaGral}>
        <Modal
          style={style}
          open={visible}
          title={title}
          footer={footer}
          onCancel={onCancel}
          width={width}
          height={height}
          centered={centered}

          destroyOnHidden={true}
          maskClosable={false}
        >
          {props.children}

        </Modal>
      </ConfigProvider>
    </>
  )

}

export const ModdalAntdConfirm = (props) => {

  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext

  const { open, title, handleOk, confirmLoading, handleCancel } = props;

  return (
    <>
      <ConfigProvider locale={idiomaGral}>
        <Modal
          destroyOnHidden={true}
          title={title}
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}

        >
          {props.children}

        </Modal>
      </ConfigProvider>
    </>
  )

}



export default ModdalMUI;


