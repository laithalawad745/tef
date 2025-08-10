// app/ClientRootLayoutContent.js
"use client";

import { ThemeProvider, useTheme } from "../context/ThemeContext";
import NavbarWrapper from "../components/NavbarWrapper";

export default function ClientRootLayoutContent({ children }) {
  return (
    <ThemeProvider>
      <ThemeContent themeChildren={children} />
    </ThemeProvider>
  );
}

function ThemeContent({ themeChildren }) {
  const { theme } = useTheme();

  // الفئات المشتركة لـ div المحتوى
  const commonClasses = `
    font-geist-sans font-geist-mono antialiased
    min-h-screen w-full
    overflow-y-auto
    relative z-10 /* للحفاظ على المحتوى فوق أي خلفية في الـ body */
  `;

  let backgroundStyles = {}; // سنستخدم style prop لتطبيق الخلفية الأصلية
  let backgroundClasses = '';

  if (theme === 'current') {
    // تطبيق الخلفية الأصلية باستخدام متغيرات CSS
    backgroundStyles = {
      // إذا كان لديك gradient overlay فوق الصورة، ابدأ به:
      // backgroundImage: 'var(--theme-background-main-original-gradient), var(--theme-background-main-original-image)',
      // وإلا فاستخدم الصورة فقط:
      backgroundImage: 'var(--theme-background-main-original-image)',
      backgroundColor: 'var(--theme-background-main-original-color)', /* لون أساسي احتياطي */
      backgroundPosition: 'var(--theme-background-main-original-position)',
      backgroundSize: 'var(--theme-background-main-original-size)',
      backgroundRepeat: 'var(--theme-background-main-original-repeat)',
      // إذا كان هناك أي أنيميشن CSS خاص بهذه الخلفية، أضف فئاته هنا
      // مثلاً: backgroundClasses = 'animate-original-bg-effect';
    };
  } else if (theme === 'dark') {
    backgroundClasses = 'bg-theme-background-main-dark-mode dark-mode-animated-effect';
  } else if (theme === 'light') {
    backgroundClasses = 'bg-theme-background-main-light-mode';
  }

  return (
    <div className={`${commonClasses} ${backgroundClasses}`} style={backgroundStyles}>
      <NavbarWrapper />
      {themeChildren}
    </div>
  );
}