import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateGpayLink = (amount: any) => {
  const upiId = "ankushdhalla.dhalla-2@okhdfcbank";
  const recipientName = "BodyStation";
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    recipientName
  )}&am=${amount.replace("₹", "").replace(",", "")}&cu=INR`;
};

export const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};
