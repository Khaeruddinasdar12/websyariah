// app/(public)/kontak/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function KontakPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.contact'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulasi pengiriman form
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Page Header */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-500 mb-4">{t('contact.title')}</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>
        </div>
      </div>

      
      <div className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('contact.contactInfo')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-xl" style={{color: 'var(--color-primary)'}}></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800">{t('contact.address')}</h3>
                    <p className="text-gray-600 mt-1">
                      {t('contact.addressValue')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-phone text-xl" style={{color: 'var(--color-primary)'}}></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800">{t('contact.phone')}</h3>
                    <p className="text-gray-600 mt-1">{t('contact.phoneValue')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-envelope text-xl" style={{color: 'var(--color-primary)'}}></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800">{t('contact.email')}</h3>
                    <p className="text-gray-600 mt-1">{t('contact.emailValue')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-xl" style={{color: 'var(--color-primary)'}}></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800">{t('contact.hours')}</h3>
                    <p className="text-gray-600 mt-1">
                      {t('contact.hoursValue')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">{t('contact.followUs')}</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.instagram.com/fshiiainbone" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 btn-soft-primary flex items-center justify-center"
                    title="Instagram @fshiiainbone"
                  >
                    <i className="fab fa-instagram" style={{color: 'var(--color-primary)'}}></i>
                  </a>
                  <a 
                    href="https://www.facebook.com/FasyahiIainBone" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 btn-soft-primary flex items-center justify-center"
                    title="Facebook @Fasyahi Iain Bone"
                  >
                    <i className="fab fa-facebook" style={{color: 'var(--color-primary)'}}></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('contact.location')}</h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative w-full" style={{paddingBottom: '56.25%', height: '450px'}}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4096.402837271695!2d120.30711280000001!3d-4.5415021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbde5a92bb162a1%3A0xde65172229a002d5!2sGedung%20Fakuktas%20Syariah%20IAIN%20BONE!5e1!3m2!1sid!2sid!4v1763828520742!5m2!1sid!2sid"
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
                <div className="p-4 text-center bg-gray-50 border-t border-gray-200">
                  <a 
                    href="https://maps.app.goo.gl/WZQsGvr1bnosCH1k6?g_st=ipc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center font-medium transition-colors"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    {t('contact.viewOnMaps')}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    );
}