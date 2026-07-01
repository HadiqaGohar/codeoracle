"use client";

import { Check, Zap, Building2, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    description: "Perfect for trying out CodeOracle",
    features: [
      "5 analyses per day",
      "Basic code explanation",
      "Bug detection",
      "README generation",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    icon: Zap,
    description: "For developers who need more power",
    features: [
      "Unlimited analyses",
      "All 7 analysis types",
      "Streaming responses",
      "Export to PDF/Markdown",
      "Analysis history",
      "Priority support",
      "Custom prompts",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    icon: Building2,
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "API access",
      "Custom integrations",
      "SSO authentication",
      "Dedicated support",
      "SLA guarantee",
      "Self-hosted option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Start for free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-gradient-to-b from-violet-900/40 to-indigo-900/40 border-2 border-violet-500/50 shadow-xl shadow-violet-500/10"
                  : "bg-zinc-900/50 border border-zinc-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.popular
                    ? "bg-violet-600/20"
                    : "bg-zinc-800/50"
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.popular ? "text-violet-400" : "text-zinc-400"}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-violet-400" : "text-emerald-400"}`} />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
