import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const newItem = action.payload;
            const newCartItem = { ...newItem, qty: 1, cartId: Date.now() + Math.random() };
            const cartItems = [...state.cartItems, newCartItem];
            return { ...state, cartItems };
        }
        case 'REMOVE_FROM_CART': {
            const cartItems = state.cartItems.filter(item => item.cartId !== action.payload);
            return { ...state, cartItems };
        }
        case 'UPDATE_QUANTITY': {
            const { id, qty } = action.payload;
            const cartItems = state.cartItems.map(item => item.cartId === id ? { ...item, qty: Math.max(1, qty) } : item);
            return { ...state, cartItems };
        }
        case 'CLEAR_CART': {
            return { ...state, cartItems: [] };
        }
        case 'LOAD_CART': {
            return { ...state, cartItems: action.payload };
        }
        default:
            return state;
    }
};

const initialState = {
    cartItems: [],
};

export const CartProvider = ({ children }) => {
    const { userInfo } = useAuth();
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage when user changes
    useEffect(() => {
        if (userInfo) {
            const storedCart = localStorage.getItem(`cart_${userInfo._id}`);
            if (storedCart) {
                dispatch({ type: 'LOAD_CART', payload: JSON.parse(storedCart) });
            }
        } else {
            dispatch({ type: 'LOAD_CART', payload: [] });
        }
    }, [userInfo]);

    // Save cart to localStorage whenever state changes
    useEffect(() => {
        if (userInfo) {
            localStorage.setItem(`cart_${userInfo._id}`, JSON.stringify(state.cartItems));
        }
    }, [state.cartItems, userInfo]);

    const addToCart = (product) => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const removeFromCart = (id) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    };

    const updateQuantity = (id, qty) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, qty } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const value = {
        cartItems: state.cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
