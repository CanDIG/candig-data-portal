import React from 'react';

// material-ui
import logo from '../assets/images/logo-2.png';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from './../../assets/images/logo-dark.svg';
 * import logo from './../../assets/images/logo.svg';
 *
 */

// ===========================|| LOGO SVG ||=========================== //

const Logo = () => <img src={logo} alt="candig-logo" width="120" />;

export default Logo;
