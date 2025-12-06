import React from 'react';
import MotionWrap from '../components/MotionWrap';

const contactMethods = [
  {
    label: 'Phone',
    value: '(555) 123-4567',
    description: 'Available Monday to Friday, 9 AM to 5 PM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
        <path
          d="M6.5 4.75A1.75 1.75 0 018.25 3h1.5a1.75 1.75 0 011.73 1.45l.42 2.34a1.75 1.75 0 01-.45 1.45l-1.1 1.1a12.5 12.5 0 005.68 5.68l1.1-1.1a1.75 1.75 0 011.45-.45l2.34.42A1.75 1.75 0 0121 15.25v1.5A1.75 1.75 0 0119.25 18h-.5C11.7 18 6 12.3 6 4.75v0z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'support@debtprotection.com',
    description: "We respond within 24 hours",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
        <path
          d="M4.75 6h14.5a1.75 1.75 0 011.75 1.75v8.5A1.75 1.75 0 0119.25 18h-14.5A1.75 1.75 0 013 16.25v-8.5A1.75 1.75 0 014.75 6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const Contact = () => {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            We are here to help. Reach out with any questions or concerns and our team will respond promptly.
          </p>
        </header>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
          <form className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5">
              <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="h-12 rounded-2xl bg-slate-100 px-4 text-sm text-slate-700 outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-12 rounded-2xl bg-slate-100 px-4 text-sm text-slate-700 outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
              <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="h-12 rounded-2xl bg-slate-100 px-4 text-sm text-slate-700 outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
              <label className="text-sm font-medium text-slate-700" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                placeholder="Enter your message"
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-lg font-semibold text-slate-900">Other Ways to Reach Us</h2>
            {contactMethods.map((method) => (
              <div key={method.label} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">{method.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                  <p className="text-sm text-slate-600">{method.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{method.description}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Contact;
