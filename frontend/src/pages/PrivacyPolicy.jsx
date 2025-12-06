import React from 'react';
import MotionWrap from '../components/MotionWrap';

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'We may collect personal details such as your name, email address, phone number, and financial information when you engage with our services or subscribe to updates.',
      'This information helps us tailor recommendations, provide relevant resources, and deliver the personalized support you expect from Debt Protection Co.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'We use your information to assess your financial situation, create customized debt protection strategies, and communicate with you about resources that can support your goals.',
      'We do not sell or share your personal data with third parties without your explicit consent.',
    ],
  },
  {
    title: 'Data Security',
    body: [
      'We maintain administrative, technical, and physical safeguards designed to protect your information from unauthorized access, disclosure, or alteration.',
      'Our website uses encryption and secure servers, and we continuously monitor our systems to uphold industry-leading standards.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    body: [
      'By accessing Debt Protection Co. resources, you agree to comply with our terms of service. These terms cover acceptable use, limitations of liability, and the procedures we follow to resolve disputes.',
      'Please review these terms carefully before using our services. Your continued use of the site signifies acceptance of these terms.',
    ],
  },
  {
    title: 'Contact Us',
    body: [
      'If you have any questions about this Privacy Policy or our Terms of Service, please contact our support team at support@debtprotection.com or call (555) 123-4567.',
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-base text-slate-600 sm:text-lg">
          We are committed to protecting your privacy. This policy explains how Debt Protection Co. collects, uses, and
          safeguards your information when you interact with our website and services.
        </p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title} id={section.id} className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
