"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

interface ErrorWithStatus {
  status: number;
}

function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return error !== null && typeof error === "object" && "status" in error;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors except 408, 429
          if (
            isErrorWithStatus(error) &&
            error.status >= 400 &&
            error.status < 500 &&
            ![408, 429].includes(error.status)
          ) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  if (!queryClient) {
    throw new Error("Failed to initialize query client");
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
