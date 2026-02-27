import logoWhite from '../../../assets/imgs/NutriFlow-white3.svg';
import logoBlack from '../../../assets/imgs/NutriFlow-black3.svg';
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCheckoutSession, extractErrorMessage } from "../../services/userService";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleSubscribe = () => {
    setLoading(true);
    createCheckoutSession()
      .then(({ checkoutUrl }) => {
        window.location.href = checkoutUrl;
      })
      .catch((err) => {
        toast.error(extractErrorMessage(err, "Failed to start checkout. Please try again."));
        setLoading(false);
      });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ImageWithFallback src={logoWhite} alt="NutriFlow Logo" className="size-10" />
            <span className="text-xl font-semibold">NutriFlow</span>
          </Link>
          {/* <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div> */}
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-5">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need for personalized nutrition and daily meal delivery
          </p>
        </div>

            <Card className="max-w-md mx-auto border-2 border-primary transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Monthly Premium</CardTitle>
                <CardDescription>Complete nutrition & delivery service</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">1500</span>
                  <span className="text-muted-foreground"> AZN /month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {[
                    "Personalized monthly menu",
                    "Certified dietitian consultation",
                    "Daily meal delivery (30 days)",
                    "Real-time delivery tracking",
                    "Macro & calorie tracking",
                    "24/7 customer support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="size-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {isLoggedIn ? (
                  <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/register">Get started</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How billing works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Submit & Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete health data submission and make your first payment to activate your subscription.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Menu Preparation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your dietitian creates your personalized menu (24-48h). You can review and approve it.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Daily Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enjoy 30 days of fresh meals. Auto-renewal monthly unless you cancel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto mt-12 bg-muted border-0">
          <CardHeader>
            <CardTitle>Need help choosing?</CardTitle>
            <CardDescription>
              Contact our support team at support@nutriflow.com or check our FAQ section for more information.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ImageWithFallback src={logoBlack} alt="NutriFlow Logo" className="size-10" />
              <span className="font-semibold text-primary">NutriFlow</span>
            </div>
            <p className="text-sm opacity-80">© 2026 NutriFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
