import React from "react";
import { AUTH_LOGO } from "./authStyles";

interface AuthLayoutProps {
  children: React.ReactNode;
  illustration: string;
  illustrationAlt?: string;
}

export function AuthBrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={AUTH_LOGO}
        alt="COFFECITO"
        className="h-[70px] w-auto object-contain"
      />
    </div>
  );
}

export default function AuthLayout({
  children,
  illustration,
  illustrationAlt = "Authentication illustration",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-[920px] rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex items-center justify-center p-8 lg:p-10 min-h-[480px]">
            <img
              src={illustration}
              alt={illustrationAlt}
              className="w-full h-auto max-w-[380px] object-contain"
            />
          </div>

          <div className="flex items-center justify-center px-8 py-12 sm:px-12 lg:px-14 min-h-[480px]">
            <div className="w-full max-w-[340px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
