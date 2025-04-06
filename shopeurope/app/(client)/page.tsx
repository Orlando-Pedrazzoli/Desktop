import Container from '@/components/Container';
import HomeBanner from '@/components/HomeBanner';
import HomeCategories from '@/components/HomeCategories';
import ProductGrid from '@/components/ProductGrid';
import { getCategories } from '@/sanity/queries';
import React from 'react';

const Home = async () => {
  const categories = await getCategories(6);
  console.log(categories);
  return (
    <Container>
      <HomeBanner />
      <div className='py-10'>
        <ProductGrid />
        <HomeCategories categories={categories} />
      </div>
    </Container>
  );
};

export default Home;
