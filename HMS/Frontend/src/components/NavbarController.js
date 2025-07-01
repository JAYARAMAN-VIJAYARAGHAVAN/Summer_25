import React, { useEffect, useState } from 'react';
import HomeNavbar from './HomeNavbar';
import AccessNavbar from './AccessNavbar';

function NavbarController() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  useEffect(() => {
    const onStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    const onUserLogin = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener('storage', onStorageChange);
    window.addEventListener('user-login', onUserLogin);

    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('user-login', onUserLogin);
    };
  }, []);

  return user ? <AccessNavbar /> : <HomeNavbar />;
}

export default NavbarController;
