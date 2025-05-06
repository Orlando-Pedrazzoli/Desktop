'use client';
import Container from '@/components/Container';
import PriceFormatter from '@/components/PriceFormatter';
import QuantityButtons from '@/components/QuantityButtons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { urlFor } from '@/sanity/lib/image';
import useCartStore from '@/store';
import { useAuth, useUser } from '@clerk/nextjs';
import { ShoppingBag, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyCart from '@/components/EmptyCart';
import NoAccessToCart from '@/components/NoAccessToCart';
import {
  createCheckoutSession,
  Metadata,
} from '@/actions/createCheckoutSession';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Loading from '@/components/Loading';
import { client } from '@/sanity/lib/client';
import { Address, ADDRESS_QUERYResult } from '@/sanity.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProductSideMenu from '@/components/ProductSideMenu';

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useCartStore();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const groupedItems = useCartStore(state => state.getGroupedItems());
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [addresses, setAddresses] = useState<ADDRESS_QUERYResult | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const query = `*[_type=="address"] | order(publishedAt desc)`;
      const data = await client.fetch(query);
      console.log(data);
      setAddresses(data);
      const defaultAddress = data.find(addr => addr.default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]); // Optional: select first address if no default
      }
    } catch (error) {
      console.log('Addresses fetching error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchAddresses();
  }, []);

  if (!isClient) {
    return <Loading />;
  }

  const handleResetCart = () => {
    const confirmed = window.confirm('Are you sure to reset your Cart?');
    if (confirmed) {
      resetCart();
      toast.success('Your cart reset successfully!');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? 'Unknown',
        customerEmail: user?.emailAddresses[0]?.emailAddress ?? 'Unknown',
        clerkUserId: user!.id,
        address: selectedAddress,
      };
      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteCartProduct(id);
    toast.success('Product deleted successfully!');
  };
  return (
    <div className='bg-gray-50 pb-52 md:pb-10'>
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              <div className='flex items-center gap-2 py-5'>
                <ShoppingBag className='h-6 w-6 text-primary' />
                <h1 className='text-2xl font-semibold'>Shopping Cart</h1>
              </div>
              <div className='grid lg:grid-cols-3 md:gap-8'>
                {/* Product View start */}
                <div className='lg:col-span-2 rounded-lg'>
                  <div className='border bg-white rounded-md'>
                    {groupedItems?.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);
                      return (
                        <div
                          key={product?._id}
                          className='border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5'
                        >
                          <div className='flex flex-1 items-start gap-2 h-36 md:h-44'>
                            {product?.images && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className='border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group'
                              >
                                <Image
                                  src={urlFor(product.images[0]).url()}
                                  alt='productImage'
                                  width={500}
                                  height={500}
                                  loading='lazy'
                                  className='w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 overflow-hidden transition-transform duration-500'
                                />
                              </Link>
                            )}
                            <div className='h-full flex flex-1 flex-col justify-between py-1'>
                              <div className='flex flex-col gap-0.5 md:gap-1.5'>
                                <h2 className='text-base font-semibold line-clamp-1'>
                                  {product?.name}
                                </h2>
                                <p className='text-sm capitalize'>
                                  Variant:{' '}
                                  <span className='font-semibold'>
                                    {product?.variant}
                                  </span>
                                </p>
                                <p className='text-sm capitalize'>
                                  Status:{' '}
                                  <span className='font-semibold'>
                                    {product?.status}
                                  </span>
                                </p>
                              </div>
                              <div className='flex items-center gap-2'>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ProductSideMenu
                                        product={product}
                                        className='relative top-0 right-0'
                                      />
                                      {/* <Heart className="w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect" /> */}
                                    </TooltipTrigger>
                                    <TooltipContent className='font-bold'>
                                      Add to Favorite
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash
                                        onClick={() =>
                                          handleDeleteProduct(product?._id)
                                        }
                                        className='w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect'
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className='font-bold bg-red-600'>
                                      Delete product
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                          <div className='flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1'>
                            <PriceFormatter
                              amount={(product?.price as number) * itemCount}
                              className='font-bold text-lg'
                            />
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      onClick={handleResetCart}
                      className='m-5 font-semibold'
                      variant='destructive'
                    >
                      Reset Cart
                    </Button>
                  </div>
                </div>

                {/* Product View end */}

                <div>
                  <div className='lg:col-span-1'>
                    <div className='hidden md:inline-block w-full bg-white p-6 rounded-lg border'>
                      <h2 className='text-xl font-semibold mb-4'>
                        Order Summary
                      </h2>
                      <div className='space-y-4'>
                        <div className='flex justify-between'>
                          <span>SubTotal</span>
                          <PriceFormatter amount={getSubTotalPrice()} />
                        </div>
                        <div className='flex justify-between'>
                          <span>Discount</span>
                          <PriceFormatter
                            amount={getSubTotalPrice() - getTotalPrice()}
                          />
                        </div>

                        <Separator />
                        <div className='flex justify-between font-semibold text-lg'>
                          <span>Total</span>

                          <PriceFormatter
                            amount={useCartStore?.getState().getTotalPrice()}
                            className='text-lg font-bold text-black'
                          />
                        </div>
                        <Button
                          onClick={handleCheckout}
                          disabled={loading}
                          className='w-full rounded-full font-semibold tracking-wide'
                          size='lg'
                        >
                          {loading ? 'Processing' : 'Proceed to Checkout'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className=''>
                    {addresses && (
                      <div className='bg-white rounded-md mt-5'>
                        <Card>
                          <CardHeader>
                            <CardTitle>Delivery Address</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              defaultValue={addresses
                                .find(addr => addr.default)
                                ?._id.toString()}
                            >
                              {addresses.map(address => (
                                <div
                                  onClick={() => setSelectedAddress(address)}
                                  key={address._id}
                                  className={`flex items-center space-x-2 mb-4 cursor-pointer ${selectedAddress?._id === address?._id && 'text-shop_dark_green'}`}
                                >
                                  <RadioGroupItem
                                    value={address._id.toString()}
                                    id={`address-${address._id}`}
                                  />
                                  <Label
                                    htmlFor={`address-${address._id}`}
                                    className='grid gap-1.5 flex-1'
                                  >
                                    <span className='font-semibold'>
                                      {address.name}
                                    </span>
                                    <span className='text-sm text-muted-foreground'>
                                      {address.address}, {address.city},{' '}
                                      {address.state} {address.zip}
                                    </span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>

                            <Button variant='outline' className='w-full mt-4'>
                              Add New Address
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
                {/* Order summary mobile view */}
                <div className='md:hidden fixed bottom-0 left-0 w-full bg-white pt-2'>
                  <div className='bg-white p-4 rounded-lg border mx-4'>
                    <h2 className='text-lg font-semibold mb-2'>
                      Order Summary
                    </h2>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span>SubTotal</span>
                        <PriceFormatter amount={getSubTotalPrice()} />
                      </div>
                      <div className='flex justify-between'>
                        <span>Discount</span>
                        <PriceFormatter
                          amount={getSubTotalPrice() - getTotalPrice()}
                        />
                      </div>

                      <Separator />
                      <div className='flex justify-between font-semibold text-lg'>
                        <span>Total</span>

                        <PriceFormatter
                          amount={useCartStore?.getState().getTotalPrice()}
                          className='text-lg font-bold text-black'
                        />
                      </div>
                      <Button
                        onClick={handleCheckout}
                        disabled={loading}
                        className='w-full rounded-full font-semibold tracking-wide'
                        size='lg'
                      >
                        {loading ? 'Processing' : 'Proceed to Checkout'}
                      </Button>
                      <Link
                        href='/'
                        className='text-center text-sm text-primary hover:underline border border-darkColor/50 rounded-full flex items-center justify-center py-2 hover:bg-darkColor/5 hover:border-darkColor hoverEffect'
                      ></Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccessToCart />
      )}
    </div>
  );
};

export default CartPage;
