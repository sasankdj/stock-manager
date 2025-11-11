import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 border-t">
            <div className="container mx-auto py-4 text-center text-sm text-gray-600">Copyright &copy; {new Date().getFullYear()} E-Commerce App</div>
        </footer>
    );
};

export default Footer;