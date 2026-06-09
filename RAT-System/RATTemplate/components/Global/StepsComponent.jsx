import React, { useContext } from 'react';
import ThemeContext from '../../context/ThemContext.jsx'

import 'antd/dist/antd.css';
import { ConfigProvider } from 'antd';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import ResultComponent from './ResultComponent.jsx'


const steps = ['Extraer de Fierebase', 'Insertar en BD', 'Actualizar'];


const StepsComponent = (props) => {

  const {
    stepOptional, stepFailed, Back, Skip, titleResult,
    subTitleResult, swicthAction, loading, colorTipe,activeStep, setActiveStep,
  } = props

  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext


  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = (step) => {
    return step === stepOptional;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const isStepFailed = (step) => {
    return step === stepFailed;
  };

  const handleNext = () => {

    let newSkipped = skipped;

    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
    swicthAction[activeStep]()
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  }

  const handleReset = () => {
    setActiveStep(0);
  }

  return (
    <ConfigProvider locale={idiomaGral}>
      <Box sx={{ width: '100%' }}>

        {activeStep !== steps.length &&
          < Stepper activeStep={activeStep}>
            {
              steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};

                if (isStepOptional(index)) {
                  labelProps.optional = (
                    <Typography variant="caption">Optional</Typography>
                  );
                }

                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }

                if (isStepFailed(index)) {
                  labelProps.optional = (
                    <Typography variant="caption" color="error">
                      Alert message
                    </Typography>
                  )

                  labelProps.error = true;
                }

                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );

              })
            }
          </Stepper>
        }

        {activeStep === steps.length ? (

          <React.Fragment>

            {/* <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography> */}
            <Box sx={{
              position: "absolute", right: "35%", top: "25%"
            }}>

              <ResultComponent
                status="success"
                title={titleResult && titleResult}
                subTitle={subTitleResult && subTitleResult}
                extra={<Button variant="contained" onClick={handleReset}>Salir</Button>}
              />
            </Box>

            {/* <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box> */}

          </React.Fragment>

        ) : (
          <React.Fragment>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>

              {Back &&
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Regresar
                </Button>
              }

              <Box sx={{ flex: '1 1 auto' }} />

              {
                Skip &&
                isStepOptional(activeStep) && (
                  <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                    Saltar
                  </Button>
                )}


              <Button onClick={handleNext}   disabled={loading}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Siguiente'}
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: colorTipe,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>


            </Box>

          </React.Fragment>
        )}


      </Box>
    </ConfigProvider >)
};

export default StepsComponent;