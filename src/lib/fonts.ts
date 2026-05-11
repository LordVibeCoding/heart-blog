import { Instrument_Sans, Roboto_Slab } from "next/font/google";

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

export const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  fallback: ["Georgia", "serif"],
});
