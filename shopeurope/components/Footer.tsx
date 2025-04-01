import React from 'react';
import Container from './Container';
import FooterTop from './FooterTop';
import Logo from './Logo';
import { SubText } from './ui/text';
import SocialMedia from './SocialMedia';

const Footer = () => {
  return (
    <footer>
      <Container>
        <FooterTop />
        <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <Logo />
            <SubText>
              Discover curated furniture collections at Shopcartyt, blending
              style and comfort to elevate your living spaces.
            </SubText>
            <SocialMedia
              className='text-darkColor/60'
              iconClassName='border-darkColor/60 hover:border-shop_light_green hover:text-shop_light_green'
            />
          </div>
          <div className=''></div>
          <div className=''></div>
          <div className=''></div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
