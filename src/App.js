import React, { useState, useEffect } from 'react';
import { commerce } from './lib/commerce';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Products, Navbar, Cart, Checkout } from './components/index';

// TODO: Host on Netlify
// dashboard.chec.io
// dashboard.stripe.com

const App = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [order, setOrder] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    const fetchProducts = async () => {
        const { data } = await commerce.products.list(); // DESTRUCTURE!!!
        setProducts(data);
    }

    const fetchCart = async () => {
        setCart(await commerce.cart.retrieve());
    }

    const handleAddToCart = async (productId, quantity) => {
        const resp = await commerce.cart.add(productId, quantity);
        setCart(resp.cart);
    }

    const handleUpdateCartQty = async (productId, quantity) => {
        const resp = await commerce.cart.update(productId, { quantity });
        setCart(resp.cart)
    }

    const handleRemoveFromCart = async (productId) => {
        const resp = await commerce.cart.remove(productId);
        setCart(resp.cart);
    }

    const handleEmptyCart = async () => {
        const resp = await commerce.cart.empty();
        setCart(resp.cart);
    }

    const refreshCart = async () => {
        const newCart = await commerce.cart.refresh();
        setCart(newCart);
    }

    const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
        try {
            const incomingOrder = await commerce.checkout.capture(checkoutTokenId, newOrder);
            setOrder(incomingOrder);
            refreshCart();
        } catch(err) {
            setErrorMessage(err.data.error.message);
            console.error(`error: `, err);
        }
    }

    useEffect(() => {
        fetchProducts();
        fetchCart();
    }, []);

    return (
        <Router>
            <div>
                <Navbar totalItems={cart.total_items}/>
                <Switch>
                    <Route exact path="/">
                        <Products products={products} onAddToCart={handleAddToCart}/>
                    </Route>
                    <Route exact path="/cart">
                        <Cart cart={cart}
                            handleUpdateCartQty={handleUpdateCartQty}
                            handleRemoveFromCart={handleRemoveFromCart}
                            handleEmptyCart={handleEmptyCart}
                        />
                    </Route>
                    <Route exact path="/checkout">
                        <Checkout cart={cart}
                            order={order} handleCaptureCheckout={handleCaptureCheckout} errorMessage={errorMessage}
                        />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
