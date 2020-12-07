import React, { useState, useEffect } from 'react';
import { Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button, CssBaseline } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import { commerce } from '../../../lib/commerce';

import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';
import useStyles from './styles';

const steps = ['Shipping address', 'Payment details'];

const Checkout = ({ cart, order, handleCaptureCheckout, errorMessage }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [shippingData, setShippingData] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        const generateToken = async () => {
            try {
                if(cart.id) {
                    const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' });

                    setCheckoutToken(token);
                }
            } catch(err) {
                console.error(`error: `, err);
                history.pushState('/');
            }
        }
        generateToken();
    }, [cart]);

    const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1)
    const prevStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1)

    const next = (data) => {
            setShippingData(data);
            nextStep();
    }

    const timeout = () => {
        setTimeout(() => {
            setIsFinished(true);
        }, 3000);
    };

    let Confirmation = () => order.customer ? (<>
        <div>
            <Typography variant="h5">Thank you for your purchase, {order.customer.firstname} {order.customer.lastname}</Typography>
            <Divider className={classes.divider}/>
            <Typography variant="subtitle2" >Order Confirmation #: {order.customer_reference}</Typography>
        </div>
        <br />
        <Button component={Link} to="/" variant="outlined" type="button">Back to Shopping</Button>
    </>) : isFinished ? ( // For portfolio only
        <>
            <div>
                <Typography variant="h5">Thank you for your purchase</Typography>
                <Divider className={classes.divider}/>
                <Typography variant="subtitle2" >Order Confirmation #: Zippity do-da</Typography>
            </div>
            <br />
            <Button component={Link} to="/" variant="outlined" type="button">Back to Shopping</Button>
        </>
    ) : (
        <div className={classes.spinner}>
            <CircularProgress />
        </div>
    );

    if(errorMessage) {
        <>
            <Typography variant="h5">Error: {errorMessage}</Typography>
            <br />
            <Button component={Link} to="/" variant="outlined" type="button">Return</Button>
        </>
    }

    const Form = () =>  activeStep === 0
        ? <AddressForm checkoutToken={checkoutToken} next={next} />
    :<PaymentForm checkoutToken={checkoutToken} shippingData={shippingData} prevStep={prevStep} nextStep={nextStep} handleCaptureCheckout={handleCaptureCheckout} timeout={timeout}/>

    return <>
        <CssBaseline />
        <div className={classes.toolbar} />
        <main className={classes.layout}>
            <Paper className={classes.paper}>
                <Typography variant="h4" align="center">Checkout</Typography>
                <Stepper activeStep={activeStep} className={classes.stepper}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
            </Paper>
        </main>
    </>;
}

export default Checkout;
