import Hero from "../components/Hero";
import Info from "../components/Info";
import Pricing from "../components/Pricing";
import Footer  from "../components/Footer ";

export default function Home() {
  return (
    <div className="pt-[4.75rem] lg:pt-[4.5rem] overflow-hidden">
      <div id="hero-section">
        <Hero/>
      </div>      
      <div id="info-section">
        <Info/>
      </div>
      <div id="pricing-section">
        <Pricing/>
      </div>
      <Footer />
    </div>
  );
}



    // <div className="min-h-screen bg-red-500 from-blue-50 to-indigo-100 flex items-center justify-center">
    //   <div className="text-center">
    //     <h1 className="text-4xl font-bold text-gray-900 mb-4">
    //       مرحباً بك في مدير أعضاء التلغرام
    //     </h1>
    //     <p className="text-lg text-gray-600 mb-8">
    //       منصة لإدارة أعضاء قنوات التلغرام بشكل تلقائي
    //     </p>
        
    //     <div className="space-x-4">
    //       <a 
    //         href="/auth/signin"
    //         className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block ml-4"
    //       >
    //         تسجيل الدخول
    //       </a>
    //       <a 
    //         href="/auth/register"
    //         className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
    //       >
    //         إنشاء حساب جديد
    //       </a>
    //     </div>
        
    //     <div className="mt-12 max-w-2xl mx-auto">
    //       <h2 className="text-2xl font-semibold text-gray-800 mb-4">المميزات</h2>
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //         <div className="bg-white p-6 rounded-lg shadow-md">
    //           <h3 className="font-semibold text-lg mb-2">إدارة القنوات</h3>
    //           <p className="text-gray-600">أضف وأدر قنوات التلغرام الخاصة بك بسهولة</p>
    //         </div>
    //         <div className="bg-white p-6 rounded-lg shadow-md">
    //           <h3 className="font-semibold text-lg mb-2">الطرد التلقائي</h3>
    //           <p className="text-gray-600">حدد مدة بقاء الأعضاء وسيتم طردهم تلقائياً</p>
    //         </div>
    //         <div className="bg-white p-6 rounded-lg shadow-md">
    //           <h3 className="font-semibold text-lg mb-2">لوحة تحكم شاملة</h3>
    //           <p className="text-gray-600">راقب جميع الأعضاء والقنوات من مكان واحد</p>
    //         </div>
    //         <div className="bg-white p-6 rounded-lg shadow-md">
    //           <h3 className="font-semibold text-lg mb-2">سهولة الاستخدام</h3>
    //           <p className="text-gray-600">واجهة بسيطة وسهلة الاستخدام</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>