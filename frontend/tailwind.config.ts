import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mechpro: {
          ink: "#0d0818",
          purple: "#6f2bff",
          violet: "#9d4edd",
          magenta: "#ff2b9f",
          mist: "#f7f3ff",
        },
      },
      boxShadow: {
        glass: "0 20px 60px rgba(111, 43, 255, 0.18)",
      },
      backgroundImage: {
        "mechpro-gradient": "linear-gradient(125deg, #6f2bff 0%, #9d4edd 46%, #ff2b9f 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
