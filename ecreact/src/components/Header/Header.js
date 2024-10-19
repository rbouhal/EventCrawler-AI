import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import LogoAndIcon from './LogoAndIcon/LogoAndIcon';
import SearchBar from './SearchBar/SearchBar';
import NavLinks from './NavLinks/NavLinks';
import Hamburger from './Hamburger/Hamburger';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 500);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/find-events') {
      setSearchTerm('');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 500);
      if (window.innerWidth > 500 && isNavOpen) {
        setIsNavOpen(false); 
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [isNavOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/find-events?location=${searchTerm}`);
      setIsNavOpen(false);
    }
  };
  

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <LogoAndIcon />
        {!isMobileView && (
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearchSubmit={handleSearchSubmit}
          />
        )}
        <Hamburger toggleNav={toggleNav} />
        <NavLinks
          isNavOpen={isNavOpen}
          isMobileView={isMobileView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchSubmit={handleSearchSubmit}
          closeNav={closeNav}
        />
      </nav>
    </header>
  );
}

export default Header;
