import React from 'react';
import { Sparkles, Heart, Award, Users, Palette, Leaf, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router-dom';

export const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion-Driven',
      description: 'Every piece is crafted with love and dedication to the art of resin creation'
    },
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'We use only premium materials and techniques to ensure lasting beauty'
    },
    {
      icon: Sparkles,
      title: 'Unique Designs',
      description: 'Each piece is one-of-a-kind, reflecting the natural beauty of resin art'
    },
    {
      icon: Leaf,
      title: 'Eco-Conscious',
      description: 'Committed to sustainable practices and environmentally safe materials'
    }
  ];

  const team = [
    {
      name: 'Maria Zahid',
      role: 'Founder',
      image: '/src/visuals/images/ma.jpg',
      bio: 'With over 05 years of experience in resin art, Maria founded ResinArt to share her passion for creating unique, beautiful pieces.'
    },
    {
      name: 'Hira Aftab',
      role: 'Lead Artist',
      image: '/src/visuals/images/hr.jpg',
      bio: 'Hira specializes in large-scale furniture pieces and brings technical expertise to complex resin projects.'
    },
    {
      name: 'Musfira Ahmed',
      role: 'Design Director',
      image: '/src/visuals/images/kh.jpg',
      bio: 'Musfira leads our design team, creating innovative patterns and color combinations that define our signature style.'
    }
  ];

  const achievements = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '5+', label: 'Years Experience' },
    { number: '500+', label: 'Unique Pieces Created' },
    { number: '99%', label: 'Customer Satisfaction' }
  ];

  const process = [
    {
      step: 1,
      title: 'Design Concept',
      description: 'We start with your vision and create detailed design concepts'
    },
    {
      step: 2,
      title: 'Material Selection',
      description: 'Premium resins and pigments are carefully selected for each project'
    },
    {
      step: 3,
      title: 'Crafting Process',
      description: 'Expert artisans bring the design to life with precision and care'
    },
    {
      step: 4,
      title: 'Quality Assurance',
      description: 'Each piece undergoes rigorous quality checks before delivery'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-20 animate-pulse" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About ResinArt
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Transforming spaces with handcrafted resin art that captures the beauty of nature and imagination
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">Our Story</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Where Art Meets Passion
              </h2>
              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  ResinArt was born from a simple passion: creating beautiful, unique art pieces that transform 
                  ordinary spaces into extraordinary experiences. What started as a hobby in a small garage has 
                  grown into a thriving business that serves customers around the world.
                </p>
                <p>
                  Our journey began when our founders, Maria Zahid & Hira Aftab, discovered the mesmerizing world of resin 
                  art. Fascinated by the fluid movements and endless possibilities of epoxy resin, she spent 
                  countless hours perfecting her craft, experimenting with colors, techniques, and materials.
                </p>
                <p>
                  Today, we're proud to be a leading name in handcrafted resin art, with a team of skilled 
                  artisans who share the same passion for creating one-of-a-kind pieces that tell a story 
                  and inspire emotions.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                <ImageWithFallback
                  src="/src/visuals/images/res.jpg"
                  alt="Resin art creation process"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Values</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Drives Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our core values guide everything we do, from the pieces we create to the relationships we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Achievements</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Numbers That Matter</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These milestones reflect our commitment to excellence and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600 font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Team</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the Artisans</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The talented individuals behind every beautiful piece we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Process</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Create Magic</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From concept to completion, every step is carefully crafted to ensure perfection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 transform translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Awards */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4">Recognition</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Awards & Certifications</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recognition for our commitment to quality and artistic excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Best Resin Art Studio 2023', organization: 'Art & Craft Awards' },
              { title: 'Excellence in Customer Service', organization: 'Business Excellence Awards' },
              { title: 'Sustainable Business Practices', organization: 'Green Business Council' },
              { title: 'Innovation in Art & Design', organization: 'Creative Industries Guild' },
              { title: 'Top Rated Seller', organization: 'Customer Choice Awards' },
              { title: 'Certified Artisan', organization: 'Professional Crafters Association' }
            ].map((award, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{award.title}</h3>
                  <p className="text-sm text-gray-600">{award.organization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who have transformed their spaces with our resin art
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Explore Our Collection
            </Button>
            </Link>
            <Link to="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Us
            </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};