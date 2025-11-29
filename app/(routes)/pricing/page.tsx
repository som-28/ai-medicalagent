'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { IconCheck, IconX, IconSparkles, IconRocket } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for trying out EchoDoc AI',
    features: [
      'Access to General Physician',
      '5 consultations per month',
      'Basic medical reports',
      'Email support',
      'Voice consultations',
    ],
    limitations: [
      'No specialist access',
      'Limited consultation time',
      'Basic reports only',
    ],
    buttonText: 'Current Plan',
    highlighted: false,
    icon: IconCheck,
  },
  {
    name: 'Premium',
    price: '₹299',
    period: 'per month',
    description: 'Best for regular health monitoring',
    features: [
      'All 10+ AI specialists',
      'Unlimited consultations',
      'Detailed medical reports',
      'Priority support',
      'PDF report downloads',
      'Consultation history',
      'Advanced health insights',
    ],
    limitations: [],
    buttonText: 'Upgrade to Premium',
    highlighted: true,
    icon: IconSparkles,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations and healthcare providers',
    features: [
      'Everything in Premium',
      'Custom AI specialists',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'HIPAA compliance',
      'Team management',
      'Advanced analytics',
    ],
    limitations: [],
    buttonText: 'Contact Sales',
    highlighted: false,
    icon: IconRocket,
  },
];

export default function PricingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  
  const isPremium = user?.publicMetadata?.isPremium === true;

  const handleUpgrade = async (planName: string) => {
    if (planName === 'Free') {
      toast.info('You are already on the Free plan');
      return;
    }
    
    if (planName === 'Enterprise') {
      toast.info('Please contact sales@echodocai.com');
      return;
    }

    if (planName === 'Premium') {
      if (!user) {
        toast.error('Please sign in to upgrade');
        return;
      }

      // Redirect to UPI payment page
      window.location.href = '/payment/upi';
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <IconSparkles size={16} />
            Simple, Transparent Pricing
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Choose Your
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> Perfect Plan</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Start free and upgrade when you need access to specialized care
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-3xl border bg-card p-8 transition-all hover:shadow-xl ${
                  plan.highlighted ? 'border-primary shadow-lg' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon size={28} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`mb-6 w-full rounded-xl ${
                    plan.highlighted ? '' : 'variant-outline'
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                  disabled={loading || (plan.name === 'Premium' && isPremium)}
                >
                  {plan.name === 'Premium' && isPremium 
                    ? 'Current Plan' 
                    : loading && plan.name === 'Premium' 
                    ? 'Processing...' 
                    : plan.buttonText}
                </Button>

                <div className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                          <IconCheck size={14} className="text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-muted p-1">
                            <IconX size={14} className="text-muted-foreground" />
                          </div>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mb-8 text-muted-foreground">
            Have questions? We're here to help.
          </p>
          <div className="mx-auto grid max-w-3xl gap-6 text-left">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-2 font-semibold">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions asked.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-2 font-semibold">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. We use industry-standard encryption and follow HIPAA guidelines to protect your health data.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-2 font-semibold">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept UPI payments. Simply scan the QR code and complete your payment.
              </p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
  );
}
