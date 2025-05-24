export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Update paths based on your project
  theme: {
    extend: {
      fontSize: {
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
      },
    },
    keyframes: {
      hoverPulse: {
        '0%': { transform: 'translateY(0)' },
        '100%': { transform: 'translateY(-3.5px)' },
      },
    },
    animation: {
      hoverPulse: 'hoverPulse 1.4s infinite alternate ease-in-out',
    },

  },
  plugins: [],
};
