import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/ui/Hero';
import FeaturedProducts from '@/components/product/FeaturedProducts';
import CategorySection from '@/components/ui/CategorySection';
import SpecialOfferBanner from '@/components/ui/SpecialOfferBanner';
import Testimonials from '@/components/ui/Testimonials';
import BrandsSection from '@/components/ui/BrandsSection';
import Newsletter from '@/components/ui/Newsletter';
import FlashSales from '@/components/ui/FlashSales';

export default function Home() {
  return (
    <MainLayout>
      <Hero />
      <SpecialOfferBanner />
      <FlashSales />
      <CategorySection />
      <FeaturedProducts />
      <Testimonials />
      <BrandsSection />
      <Newsletter />
    </MainLayout>
  );
}
