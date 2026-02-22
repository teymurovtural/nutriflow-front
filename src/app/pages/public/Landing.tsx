import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Check, Leaf, ChefHat, Calendar, Heart, Clock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useTranslation } from "react-i18next";
import { LANGUAGES, type LangCode } from "../../../i18n";
import i18n from "../../../i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

function LanguageSwitcher() {
  const currentLang = (i18n.language?.slice(0, 2) ?? "en") as LangCode;
  return (
    <Select value={currentLang} onValueChange={(val) => i18n.changeLanguage(val)}>
      <SelectTrigger className="w-[80px] h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function Landing() {
  const { t } = useTranslation();

  const whatIsCards = [
    {
      icon: Heart,
      title: t("whatIsNutriflow.cards.healthFirst.title"),
      description: t("whatIsNutriflow.cards.healthFirst.description"),
    },
    {
      icon: ChefHat,
      title: t("whatIsNutriflow.cards.expertDietitians.title"),
      description: t("whatIsNutriflow.cards.expertDietitians.description"),
    },
    {
      icon: Calendar,
      title: t("whatIsNutriflow.cards.dailyDelivery.title"),
      description: t("whatIsNutriflow.cards.dailyDelivery.description"),
    },
  ];

  const featuresBullets1 = t("features.personalizedPlans.bullets", { returnObjects: true }) as string[];
  const featuresBullets2 = t("features.freshIngredients.bullets", { returnObjects: true }) as string[];
  const featuresBullets3 = t("features.dailyDelivery.bullets", { returnObjects: true }) as string[];
  const howItWorksSteps = t("howItWorks.steps", { returnObjects: true }) as { title: string; description: string }[];
  const pricingFeatures = t("pricingPreview.features", { returnObjects: true }) as string[];
  const whoCards = t("whoItsFor.cards", { returnObjects: true }) as { title: string; description: string }[];
  const whoIcons = [<Clock className="size-8" />, <Heart className="size-8" />, <Shield className="size-8" />];
  const faqItems = t("faq.items", { returnObjects: true }) as { q: string; a: string }[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ImageWithFallback src={"src/assets/imgs/NutriFlow-white3.svg"} alt="NutriFlow Logo" className="size-8" />
            <span className="text-xl font-semibold">NutriFlow</span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">
              {t("nav.howItWorks")}
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              {t("nav.pricing")}
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition">
              {t("nav.about")}
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition">
              {t("nav.faq")}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" asChild className="transition-transform hover:scale-105 active:scale-95">
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button asChild className="transition-transform hover:scale-105 active:scale-95">
              <Link to="/register">{t("nav.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero + Hero Image side-by-side */}
      <section className="container mx-auto px-36 py-5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full mb-6"
            >
              <Leaf className="size-4" />
              <span className="text-sm font-medium">{t("hero.badge")}</span>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
            >
              {t("hero.titleStart")}
              <span className="text-primary">{t("hero.titleHighlight")}</span>
              {t("hero.titleEnd")}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild className="transition-transform hover:scale-105 active:scale-95">
                <Link to="/register">{t("hero.cta")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="transition-transform hover:scale-105 active:scale-95">
                <Link to="/pricing">{t("hero.viewPricing")}</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1667499745120-f9bcef8f584e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBjb250YWluZXJzfGVufDF8fHx8MTc3MTQ5NDU2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Healthy meal prep containers with nutritious meals"
              className="w-full h-[480px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* What is NutriFlow */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whatIsNutriflow.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("whatIsNutriflow.description")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whatIsCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <Icon className="size-10 text-primary mb-4" />
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h3 className="text-3xl font-bold mb-4">{t("features.personalizedPlans.title")}</h3>
                <p className="text-lg text-muted-foreground mb-6">{t("features.personalizedPlans.description")}</p>
                <ul className="space-y-3">
                  {featuresBullets1.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="size-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1621758745802-6c16a087ca32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb3VzJTIwbWVhbCUyMHBsYW5uaW5nfGVufDF8fHx8MTc3MTQ5NDU3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={t("features.personalizedPlans.imgAlt")}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl md:order-1">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1681330266932-391fd00f805f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwYm93bCUyMG51dHJpdGlvbnxlbnwxfHx8fDE3NzE0OTQ1Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={t("features.freshIngredients.imgAlt")}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="md:order-2">
                <h3 className="text-3xl font-bold mb-4">{t("features.freshIngredients.title")}</h3>
                <p className="text-lg text-muted-foreground mb-6">{t("features.freshIngredients.description")}</p>
                <ul className="space-y-3">
                  {featuresBullets2.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="size-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h3 className="text-3xl font-bold mb-4">{t("features.dailyDelivery.title")}</h3>
                <p className="text-lg text-muted-foreground mb-6">{t("features.dailyDelivery.description")}</p>
                <ul className="space-y-3">
                  {featuresBullets3.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="size-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1605291566628-6f0c7f5b9453?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc3MTQwODA2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={t("features.dailyDelivery.imgAlt")}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("howItWorks.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("howItWorks.subtitle")}</p>
          </motion.div>
          <div className="max-w-4xl mx-auto space-y-8">
            {howItWorksSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-4xl mx-auto mt-10 text-center text-muted-foreground italic"
          >
            {t("howItWorks.tagline")}
          </motion.p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricingPreview.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("pricingPreview.subtitle")}</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-md mx-auto border-2 border-primary transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t("pricingPreview.planName")}</CardTitle>
                <CardDescription>{t("pricingPreview.planDescription")}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{t("pricingPreview.price")}</span>
                  <span className="text-muted-foreground"> {t("pricingPreview.currency")}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pricingFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="size-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/register">{t("pricingPreview.cta")}</Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4 text-center">{t("pricingPreview.note")}</p>
                <p className="text-xs text-muted-foreground mt-2 text-center font-medium">{t("pricingPreview.noHiddenFees")}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whoItsFor.title")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whoCards.map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className="text-primary mb-4">{whoIcons[index]}</div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("aboutUs.title")}</h2>
              <p className="text-lg text-muted-foreground mb-6">{t("aboutUs.description")}</p>
              <p className="text-base font-semibold mb-1">{t("aboutUs.missionLabel")}</p>
              <p className="text-lg text-primary font-medium mb-6">{t("aboutUs.mission")}</p>
              <p className="text-muted-foreground italic">{t("aboutUs.belief")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
            >
              {t("faq.title")}
            </motion.h2>
            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.q}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="text-center mt-8 text-muted-foreground"
            >
              {t("faq.contact")}{" "}
              <a href="mailto:support@nutriflow.com" className="text-primary underline underline-offset-4">
                support@nutriflow.com
              </a>
            </motion.p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-20 bg-primary text-primary-foreground"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg mb-8 opacity-90">{t("cta.subtitle")}</p>
          <Button size="lg" variant="secondary" asChild className="transition-transform hover:scale-105 active:scale-95">
            <Link to="/register">{t("cta.button")}</Link>
          </Button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ImageWithFallback src={"src/assets/imgs/NutriFlow-black3.svg"} alt="NutriFlow Logo" className="size-8" />
              <span className="text-lg font-semibold">NutriFlow</span>
            </div>
            <p className="text-sm opacity-80">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
