"use client";

import Providers from "@/components/providers/Providers";
import { ReactNode } from "react";

export default function RootProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
} 