/*
=== CONFIGURATION FILES FOR LOCAL DEVELOPMENT ===
Copy these to individual files in your local project:

1. jsconfig.json (in project root):
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/api/entities/*": ["entities/*"],
      "@/api/integrations/*": ["integrations/*"],
      "@/utils": ["utils/index.js"]
    }
  },
  "include": ["src/**/*"]
}

2. tailwind.config.js (in project root):
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}

3. postcss.config.js (in project root):
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

4. public/index.html:
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="EmeraldMind - Generation III ROM Hack Studio"
    />
    <title>EmeraldMind - ROM Hack Studio</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
*/

export default null;