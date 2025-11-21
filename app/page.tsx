"use client";

import { motion } from "motion/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { IconBrain, IconMicrophone, IconFileAnalytics, IconShield, IconClock, IconUsers } from "@tabler/icons-react";

export default function LandingPage() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <IconBrain size={16} />
              AI-Powered Healthcare
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Your Personal
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> AI Medical </span>
              Assistant
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Connect with AI specialist doctors through voice consultations. 
              Get instant medical advice and automated health reports, available 24/7.
            </p>

            <div className="flex w-full flex-col items-center justify-center gap-4 px-4 sm:flex-row">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 sm:min-w-[200px]">
                  <IconMicrophone size={20} />
                  Start Consultation
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:min-w-[200px]">
                  View Specialists
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">AI Specialists</div>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-primary">Instant</div>
              <div className="text-sm text-muted-foreground">Medical Reports</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Choose EchoDoc AI?
            </h2>
            <p className="text-lg text-muted-foreground">
              Advanced AI technology meets healthcare expertise
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<IconMicrophone size={24} />}
              title="Voice Consultations"
              description="Natural conversations with AI doctors through advanced voice technology"
            />
            <FeatureCard
              icon={<IconFileAnalytics size={24} />}
              title="Instant Reports"
              description="Get detailed medical reports generated automatically after each consultation"
            />
            <FeatureCard
              icon={<IconClock size={24} />}
              title="24/7 Availability"
              description="Access medical advice anytime, anywhere without waiting"
            />
            <FeatureCard
              icon={<IconUsers size={24} />}
              title="Multiple Specialists"
              description="Choose from 10+ AI specialists covering various medical fields"
            />
            <FeatureCard
              icon={<IconShield size={24} />}
              title="Secure & Private"
              description="Your health data is encrypted and protected at all times"
            />
            <FeatureCard
              icon={<IconBrain size={24} />}
              title="AI-Powered"
              description="Powered by advanced AI models for accurate health insights"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl rounded-3xl border bg-gradient-to-br from-primary/10 to-blue-500/10 p-6 text-center sm:p-8 md:p-12"
        >
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
            Join thousands using EchoDoc AI for their healthcare needs
          </p>
          <Link href="/dashboard" className="inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:min-w-[200px]">
              Start Your First Consultation
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg"
    >
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src={"/logomain.svg"}
            alt={"EchoDoc AI Logo"}
            width={40}
            height={40}
          />
          <h1 className="text-xl font-bold">EchoDoc AI</h1>
        </Link>
        {!user ? (
          <Link href={"/sign-in"}>
            <Button>
              Sign In
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </div>
    </nav>
  );
};
