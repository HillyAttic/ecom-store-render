"use client";

import Image from 'next/image';
import { Users, ShoppingBag, Globe2, Award } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Active Customers', value: '100K+' },
    { icon: ShoppingBag, label: 'Products Sold', value: '500K+' },
    { icon: Globe2, label: 'Countries Served', value: '50+' },
    { icon: Award, label: 'Years of Excellence', value: '10+' },
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3',
      bio: 'Visionary leader with 15+ years in e-commerce',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3',
      bio: 'Award-winning designer passionate about user experience',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3',
      bio: 'Tech enthusiast driving product innovation',
    },
    {
      name: 'David Kim',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3',
      bio: 'Dedicated to delivering exceptional customer service',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 md:py-20" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16" suppressHydrationWarning>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" suppressHydrationWarning>
              About Exclusive
            </h1>
            <p className="text-lg text-gray-600" suppressHydrationWarning>
              We're on a mission to revolutionize online shopping by providing high-quality products, 
              exceptional service, and an unmatched customer experience.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20" suppressHydrationWarning>
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
                suppressHydrationWarning
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600" suppressHydrationWarning>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Our Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20" suppressHydrationWarning>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden" suppressHydrationWarning>
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3"
                alt="Our office"
                fill
                className="object-cover"
              />
            </div>
            <div suppressHydrationWarning>
              <h2 className="text-3xl font-bold text-gray-900 mb-6" suppressHydrationWarning>Our Story</h2>
              <div className="space-y-4 text-gray-600" suppressHydrationWarning>
                <p>
                  Founded in 2013, Exclusive began with a simple idea: make quality products accessible to everyone. 
                  What started as a small online store has grown into a global marketplace serving customers worldwide.
                </p>
                <p>
                  Our commitment to innovation, sustainability, and customer satisfaction has made us a trusted name 
                  in e-commerce. We carefully curate our product selection, partner with reliable suppliers, and 
                  maintain rigorous quality standards.
                </p>
                <p>
                  Today, we're proud to offer a diverse range of products across multiple categories, supported by 
                  a dedicated team that shares our passion for excellence.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20" suppressHydrationWarning>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" suppressHydrationWarning>Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8" suppressHydrationWarning>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" suppressHydrationWarning>
                <h3 className="text-xl font-bold text-gray-900 mb-4" suppressHydrationWarning>Quality First</h3>
                <p className="text-gray-600" suppressHydrationWarning>
                  We never compromise on quality. Every product in our catalog meets strict standards for 
                  excellence and durability.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" suppressHydrationWarning>
                <h3 className="text-xl font-bold text-gray-900 mb-4" suppressHydrationWarning>Customer Focus</h3>
                <p className="text-gray-600" suppressHydrationWarning>
                  Our customers are at the heart of everything we do. We're committed to providing an 
                  exceptional shopping experience.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" suppressHydrationWarning>
                <h3 className="text-xl font-bold text-gray-900 mb-4" suppressHydrationWarning>Innovation</h3>
                <p className="text-gray-600" suppressHydrationWarning>
                  We continuously evolve and adapt to bring you the latest products and shopping technologies.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div suppressHydrationWarning>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" suppressHydrationWarning>Meet Our Team</h2>
            <div className="grid md:grid-cols-4 gap-8" suppressHydrationWarning>
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                  suppressHydrationWarning
                >
                  <div className="relative aspect-square" suppressHydrationWarning>
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6" suppressHydrationWarning>
                    <h3 className="text-lg font-bold text-gray-900 mb-1" suppressHydrationWarning>{member.name}</h3>
                    <div className="text-blue-600 text-sm mb-3" suppressHydrationWarning>{member.role}</div>
                    <p className="text-gray-600 text-sm" suppressHydrationWarning>{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 