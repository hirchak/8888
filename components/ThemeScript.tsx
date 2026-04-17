'use client';
// Inline script to prevent flash of wrong theme
// Must be in <head> before body renders
export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('nexus_theme');
              if (theme === 'light') {
                document.documentElement.classList.add('light');
              } else {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        `,
      }}
    />
  );
}
