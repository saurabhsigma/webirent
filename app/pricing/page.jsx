'use client';

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const pricingPlans = [
  {
    title: 'Free',
    price: '$0',
    period: 'Forever',
    features: [
      'Access to basic templates',
      'Limited customizations',
      'Community support',
    ],
    highlight: false,
  },
  {
    title: 'Pro Monthly',
    price: '$19',
    period: 'per month',
    features: [
      'Access to all templates',
      'Full customization tools',
      'Priority support',
      'AI content suggestions',
    ],
    highlight: true,
  },
  {
    title: 'Pro Yearly',
    price: '$199',
    period: 'per year',
    features: [
      'Everything in Pro Monthly',
      '2 months free',
      'Exclusive new features',
    ],
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <section className="relative py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Choose Your Plan
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.title}
              className={`rounded-xl border transition-all duration-300 hover:shadow-2xl p-8 bg-gradient-to-br ${
                plan.highlight
                  ? 'from-purple-600/30 to-pink-600/10 border-purple-500'
                  : 'from-gray-800 to-gray-900 border-gray-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
              <div className="text-4xl font-bold mb-2">{plan.price}</div>
              <div className="text-gray-400 mb-6">{plan.period}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <FiCheck className="text-green-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-300 ${
                  plan.highlight
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {plan.highlight ? 'Start Pro Plan' : 'Get Started'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
