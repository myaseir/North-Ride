"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-16 pt-12 border-t border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-slate-100 rounded-2xl bg-slate-50 overflow-hidden cursor-pointer transition-colors hover:bg-slate-100/50"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex items-center justify-between p-5 font-semibold text-slate-900 text-left">
              <span>{faq.question}</span>
              <ChevronDown 
                size={20} 
                className={`text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
              />
            </div>
            {/* Answer Section */}
            <div 
              className={`px-5 text-slate-600 text-sm font-medium leading-relaxed transition-all duration-300 ease-in-out ${
                openIndex === index ? 'pb-5 max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}