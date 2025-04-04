import Container from '@/components/Container';
import HomeBanner from '@/components/HomeBanner';
import ProductGrid from '@/components/ProductGrid';
import React from 'react';

const page = () => {
  return (
    <Container>
      <HomeBanner />
      <div className='py-10'>
        <ProductGrid />
      </div>
    </Container>
  );
};

export default page;
