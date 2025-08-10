'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

function Dashboard() {
  const [channels, setChannels] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState({ isRunning: false });

  // نماذج الإدخال
  const [newChannel, setNewChannel] = useState({
    name: '',
    telegramId: ''
  });

  const [newMember, setNewMember] = useState({
    telegramId: '',
    username: '',
    firstName: '',
    lastName: '',
    channelId: '',
    minutes: 1
  });

  // جلب البيانات
  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('خطأ في جلب القنوات:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('خطأ في جلب الأعضاء:', error);
    }
  };

  // وظائف المجدول
  const checkSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/scheduler');
      const data = await response.json();
      setSchedulerStatus(data.scheduler_status || { isRunning: false });
    } catch (error) {
      console.error('خطأ في جلب حالة المجدول');
    }
  };

  const startScheduler = async () => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      await checkSchedulerStatus();
    } catch (error) {
      console.error('خطأ في تشغيل المجدول');
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  // إضافة قناة
  const addChannel = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel)
      });

      if (response.ok) {
        alert('تم إضافة القناة بنجاح!');
        setNewChannel({ name: '', telegramId: '' });
        await fetchChannels();
      } else {
        const error = await response.json();
        alert('حدث خطأ: ' + (error.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      alert('حدث خطأ في إضافة القناة');
    } finally {
      setLoading(false);
    }
  };

  // إضافة عضو
  const addMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const kickDate = new Date();
      kickDate.setMinutes(kickDate.getMinutes() + parseInt(newMember.minutes));
      
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMember,
          minutes: parseInt(newMember.minutes),
          kickDate: kickDate.toISOString()
        })
      });

      if (response.ok) {
        alert('تم إضافة العضو بنجاح! سيتم طرده تلقائياً بعد ' + newMember.minutes + ' دقيقة');
        setNewMember({
          telegramId: '',
          username: '',
          firstName: '',
          lastName: '',
          channelId: '',
          minutes: 1
        });
        await fetchMembers();
      } else {
        const error = await response.json();
        alert('حدث خطأ: ' + (error.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      alert('حدث خطأ في إضافة العضو');
    } finally {
      setLoading(false);
    }
  };

  // useEffect - بعد تعريف جميع الوظائف
  useEffect(() => {
    const initializeApp = async () => {
      await fetchChannels();
      await fetchMembers();
      await checkSchedulerStatus();
      await startScheduler();
    };
    
    initializeApp();
    
    // تحديث حالة المجدول كل 10 ثوان
    const statusInterval = setInterval(checkSchedulerStatus, 10000);
    
    return () => clearInterval(statusInterval);
  }, []);

  return (
    <div className="min-h-screen bg--theme-background-main-original-color from-[#0d0d1f] via-[#1b1b32] to-[#2a2a4e] text-white pt-12" dir="rtl">
      {/* Animated Background */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-first"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-second"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-third"></div>
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-fourth"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-fifth"></div>
        </div>
      </div> */}

      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="bg-[#12111199] backdrop-blur-lg border border-gray-800 rounded-2xl p-6 mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#9D4EDD] via-[#4EA8DE] to-[#FF6B6B] bg-clip-text text-transparent">
            لوحة التحكم - إدارة أعضاء التلغرام
          </h1>
          {/* <div className="flex justify-center items-center gap-4 flex-wrap">
            <span className="text-gray-300 flex items-center gap-2">
              <span className="text-green-400">✅</span>
              المشروع يعمل بنجاح!
            </span>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              schedulerStatus?.isRunning 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              الطرد التلقائي: {schedulerStatus?.isRunning ? 'يعمل 🟢' : 'متوقف 🔴'}
            </div>
          </div> */}
        </div>

        {/* إضافة قناة جديدة */}
        <div className="bg-[#12111199] backdrop-blur-lg border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#4EA8DE]">
            إضافة قناة جديدة
          </h2>
          <form onSubmit={addChannel} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="اسم القناة"
              value={newChannel.name}
              onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
              className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4EA8DE] transition-colors"
              required
            />
            <input 
              type="text" 
              placeholder="معرف القناة (-1001234567890)"
              value={newChannel.telegramId}
              onChange={(e) => setNewChannel({...newChannel, telegramId: e.target.value})}
              className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4EA8DE] transition-colors"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#4EA8DE] to-[#5E60CE] hover:from-[#5E60CE] hover:to-[#4EA8DE]'
              }`}
            >
              {loading ? 'إضافة...' : 'إضافة قناة'}
            </button>
          </form>
        </div>

        {/* عرض القنوات */}
        {channels.length > 0 && (
          <div className="bg-[#12111199] backdrop-blur-lg border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-[#48BFE3]">
              القنوات المتاحة ({channels.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">اسم القناة</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">معرف التلغرام</th>
                    <th className="px-4 py-3 text-center text-gray-400 font-semibold">عدد الأعضاء</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((channel, index) => (
                    <tr 
                      key={channel.id} 
                      className={`border-b border-gray-800 hover:bg-[#1b1b32] transition-colors ${
                        index % 2 === 0 ? 'bg-[#12111155]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-white">{channel.name}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-300" dir="ltr">
                        {channel.telegramId}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {channel._count?.members || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {formatDate(channel.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* إضافة عضو جديد */}
        {channels.length > 0 && (
          <div className="bg-[#12111199] backdrop-blur-lg border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#ffc876]">
              إضافة عضو جديد
            </h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <span>✨</span>
                <strong>ملاحظة:</strong> سيتم طرد العضو تلقائياً بعد انتهاء المدة المحددة
              </p>
            </div>
            <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="معرف المستخدم"
                value={newMember.telegramId}
                onChange={(e) => setNewMember({...newMember, telegramId: e.target.value})}
                className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffc876] transition-colors"
                required
              />
              <input 
                type="text" 
                placeholder="اسم المستخدم (اختياري)"
                value={newMember.username}
                onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffc876] transition-colors"
              />
              <input 
                type="text" 
                placeholder="الاسم الأول (اختياري)"
                value={newMember.firstName}
                onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffc876] transition-colors"
              />
              <select
                value={newMember.channelId}
                onChange={(e) => setNewMember({...newMember, channelId: e.target.value})}
                className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#ffc876] transition-colors"
                required
              >
                <option value="" className="bg-[#1b1b32]">اختر القناة</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id} className="bg-[#1b1b32]">
                    {channel.name}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="دقائق (1)"   
                value={newMember.minutes}
                onChange={(e) => setNewMember({...newMember, minutes: e.target.value})}
                className="px-4 py-3 bg-[#1b1b32] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffc876] transition-colors"
                min="1"
                max="1440"
                required
              />
              <button 
                type="submit"
                disabled={loading}
                className="block py-2 px-4 text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90"

              >
                {loading ? 'إضافة...' : 'إضافة عضو (طرد تلقائي)'}
              </button>
            </form>
          </div>
        )}

        {/* عرض الأعضاء */}
        {members.length > 0 && (
          <div className="bg-[#12111199] backdrop-blur-lg border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#9D4EDD]">
              الأعضاء المضافون ({members.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">معرف المستخدم</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">الاسم</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">القناة</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">تاريخ الطرد</th>
                    <th className="px-4 py-3 text-center text-gray-400 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr 
                      key={member.id}
                      className={`border-b border-gray-800 hover:bg-[#1b1b32] transition-colors ${
                        index % 2 === 0 ? 'bg-[#12111155]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-gray-300" dir="ltr">
                        {member.telegramId}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {member.firstName && member.lastName 
                          ? `${member.firstName} ${member.lastName}`
                          : member.username 
                          ? `@${member.username}`
                          : 'غير محدد'
                        }
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {member.channel?.name || 'غير معروف'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {formatDate(member.kickDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          member.isActive 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {member.isActive ? '⏳ انتظار' : '✅ تم طرده'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// استخدام dynamic import لتجنب مشاكل SSR
export default dynamic(() => Promise.resolve(Dashboard), {
  ssr: false
});