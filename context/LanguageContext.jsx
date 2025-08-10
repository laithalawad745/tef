// context/LanguageContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navbar
    navbar: {
      brand: "Telegram Copilot",
      contact: "Contact",
      pricing: "Pricing",
      register: "Register",
      signin: "Sign In",
    },
    
    // Hero Section
    hero: {
      welcome: "Welcome To Websites Telegram Copilot",
      subtitle: "At Telegram Copilot we offer Telegram subset management service",
    },
    
    // Info Section
    info: {
      groupManagement: {
        title: "Group management",
        description: "It will automatically identify people in your group and expel them when the subscription ends",
      },
      completeManagement: {
        title: "Complete management",
        description: "Our specialized team will receive your entire package and contact the people to confirm payment and everything",
        note: "That is, it will not require any intervention from you at all",
      },
    },
    
    // Pricing Section
    pricing: {
      basic: {
        title: "Basic",
        price: "$29",
        period: "/month",
        features: [
          "Up to 1000 members",
          "Basic bot features",
          "24/7 Support",
          "Auto-moderation"
        ],
        button: "Get Started"
      },
      premium: {
        title: "Premium",
        price: "$59",
        period: "/month",
        features: [
          "Up to 5000 members",
          "Advanced bot features",
          "Priority 24/7 Support",
          "Custom commands",
          "Analytics dashboard"
        ],
        button: "Get Started"
      },
      enterprise: {
        title: "Enterprise",
        price: "Custom",
        period: "",
        features: [
          "Unlimited members",
          "All premium features",
          "Dedicated account manager",
          "Custom integrations",
          "White-label solution"
        ],
        button: "Contact Us"
      }
    },
    
    // Footer
    footer: {
      description: "We provide innovative AI solutions to improve user experience and business development.",
      quickLinks: {
        title: "Quick links",
        home: "Home",
        products: "Products",
        aboutUs: "Who are we"
      },
      services: {
        title: "Our services",
        telegramBots: "Telegram bots",
        telegramManagement: "Telegram management",
        subsetManagement: "Subset management"
      },
      contact: "Contact us",
      copyright: "All rights reserved",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms and Conditions"
    }
  },
  
  ar: {
    // Navbar
    navbar: {
      brand: "تيليجرام كوبايلوت",
      contact: "اتصل بنا",
      pricing: "الأسعار",
      register: "تسجيل",
      signin: "تسجيل الدخول",
    },
    
    // Hero Section
    hero: {
      welcome: "مرحباً بكم في موقع تيليجرام كوبايلوت",
      subtitle: "في تيليجرام كوبايلوت نقدم خدمة إدارة الاشتراكات لتيليجرام",
    },
    
    // Info Section
    info: {
      groupManagement: {
        title: "إدارة المجموعات",
        description: "سيقوم تلقائياً بتحديد الأشخاص في مجموعتك وطردهم عند انتهاء الاشتراك",
      },
      completeManagement: {
        title: "إدارة كاملة",
        description: "سيستلم فريقنا المتخصص حزمتك بالكامل ويتواصل مع الأشخاص لتأكيد الدفع وكل شيء",
        note: "أي أنه لن يتطلب أي تدخل منك على الإطلاق",
      },
    },
    
    // Pricing Section
    pricing: {
      basic: {
        title: "الأساسية",
        price: "29$",
        period: "/شهرياً",
        features: [
          "حتى 1000 عضو",
          "ميزات البوت الأساسية",
          "دعم على مدار الساعة",
          "الإشراف التلقائي"
        ],
        button: "ابدأ الآن"
      },
      premium: {
        title: "المميزة",
        price: "59$",
        period: "/شهرياً",
        features: [
          "حتى 5000 عضو",
          "ميزات البوت المتقدمة",
          "دعم أولوية على مدار الساعة",
          "أوامر مخصصة",
          "لوحة تحليلات"
        ],
        button: "ابدأ الآن"
      },
      enterprise: {
        title: "المؤسسات",
        price: "مخصص",
        period: "",
        features: [
          "أعضاء غير محدودين",
          "جميع الميزات المميزة",
          "مدير حساب مخصص",
          "تكاملات مخصصة",
          "حل العلامة البيضاء"
        ],
        button: "اتصل بنا"
      }
    },
    
    // Footer
    footer: {
      description: "نقدم حلول الذكاء الاصطناعي المبتكرة لتحسين تجربة المستخدم وتطوير الأعمال.",
      quickLinks: {
        title: "روابط سريعة",
        home: "الرئيسية",
        products: "المنتجات",
        aboutUs: "من نحن"
      },
      services: {
        title: "خدماتنا",
        telegramBots: "بوتات تيليجرام",
        telegramManagement: "إدارة تيليجرام",
        subsetManagement: "إدارة الاشتراكات"
      },
      contact: "اتصل بنا",
      copyright: "جميع الحقوق محفوظة",
      privacyPolicy: "سياسة الخصوصية",
      termsConditions: "الشروط والأحكام"
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLanguage);
    setIsRTL(savedLanguage === 'ar');
    
    // Set document direction
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLanguage;
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    setIsRTL(newLanguage === 'ar');
    
    // Save preference
    localStorage.setItem('preferredLanguage', newLanguage);
    
    // Update document direction
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};




// 🎯 الخطوات الأساسية لإضافة الترجمة لأي مكون:
// 1️⃣ إضافة "use client" في أعلى الملف
// javascript"use client";
// 2️⃣ استيراد hook اللغة
// javascriptimport { useLanguage } from "../context/LanguageContext";
// 3️⃣ استخدام hook داخل المكون
// javascriptconst YourComponent = () => {
//   const { t, isRTL, language } = useLanguage();
//   // باقي الكود
// }
// 4️⃣ استبدال النصوص الثابتة بـ t() function
// javascript// بدلاً من:
// <h1>Welcome</h1>

// // استخدم:
// <h1>{t('hero.welcome')}</h1>
// 5️⃣ إضافة دعم RTL للعناصر
// javascript// للنصوص:
// <p className={`text-lg ${isRTL ? 'text-right' : 'text-left'}`}>
//   {t('your.text.key')}
// </p>

// // للعناصر المرنة (Flexbox):
// <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
//   {/* المحتوى */}
// </div>

// // للهوامش:
// <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
//   {/* المحتوى */}
// </div>

// 📝 مثال عملي كامل:
// قبل (بدون ترجمة):
// javascriptimport Image from "next/image";

// const ExampleComponent = () => {
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl">Hello World</h1>
//       <p className="ml-4">This is a description</p>
//       <button>Click Me</button>
//     </div>
//   );
// };

// export default ExampleComponent;
// بعد (مع الترجمة):
// javascript"use client";
// import Image from "next/image";
// import { useLanguage } from "../context/LanguageContext";

// const ExampleComponent = () => {
//   const { t, isRTL } = useLanguage();

//   return (
//     <div className="p-4">
//       <h1 className={`text-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
//         {t('example.title')}
//       </h1>
//       <p className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
//         {t('example.description')}
//       </p>
//       <button>{t('example.button')}</button>
//     </div>
//   );
// };

// export default ExampleComponent;

// 🔧 إضافة الترجمات في LanguageContext:
// 1. افتح ملف context/LanguageContext.jsx
// 2. أضف المفاتيح الجديدة في كل من en و ar:
// javascriptexport const translations = {
//   en: {
//     // أضف هنا
//     example: {
//       title: "Hello World",
//       description: "This is a description",
//       button: "Click Me"
//     }
//   },
//   ar: {
//     // أضف هنا
//     example: {
//       title: "مرحبا بالعالم",
//       description: "هذا وصف",
//       button: "اضغط هنا"
//     }
//   }
// };

// 🎨 حالات خاصة:
// 1. القوائم (Lists)
// javascript// في الترجمات:
// features: ["Feature 1", "Feature 2", "Feature 3"]

// // في المكون:
// {t('pricing.features').map((feature, index) => (
//   <li key={index}>{feature}</li>
// ))}
// 2. النصوص مع متغيرات
// javascript// في الترجمات:
// welcome: "Welcome, {name}!"

// // في المكون:
// {t('welcome').replace('{name}', userName)}
// 3. الصور والأيقونات مع RTL
// javascript<div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
//   <Image src={icon} alt="icon" />
//   <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
//     {t('text')}
//   </span>
// </div>
// 4. الأزرار مع اتجاهات
// javascript<button className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
//   <span>{t('button.text')}</span>
//   <ChevronIcon className={`${isRTL ? 'rotate-180' : ''}`} />
// </button>

// ⚡ نصائح مهمة:

// دائماً أضف "use client" في أعلى المكونات التي تستخدم hooks
// استخدم isRTL للتحكم في:

// اتجاه النص (text-right/text-left)
// اتجاه العناصر (flex-row-reverse)
// الهوامش (mr/ml)
// دوران الأيقونات (rotate-180)


// تنظيم المفاتيح: استخدم تنظيم هرمي للمفاتيح:
// javascriptnavbar.menu.home
// pricing.basic.title
// footer.links.about

// الأرقام والعملات: احتفظ بها كما هي أو استخدم formatter:
// javascriptconst price = language === 'ar' ? '٣٠ دولار' : '$30';



// 🚀 خطوات سريعة للنسخ واللصق:
// javascript// 1. أضف في أعلى الملف:
// "use client";
// import { useLanguage } from "../context/LanguageContext";

// // 2. داخل المكون:
// const { t, isRTL } = useLanguage();

// // 3. للنصوص:
// {t('your.key.here')}

// // 4. للاتجاهات:
// className={`${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}

// // 5. للهوامش:
// className={`${isRTL ? 'mr-4' : 'ml-4'}`}

// 📌 ملاحظة أخيرة:
// لا تنسَ إضافة الترجمات الفعلية في LanguageContext.jsx لكل مفتاح تستخدمه!