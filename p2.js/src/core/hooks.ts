import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

interface FetchOptions {
  validate?: z.ZodSchema;
  cache?: boolean;
  revalidate?: number;
}

export function useP2Query<T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: FetchOptions = {}
) {
  const queryKey = Array.isArray(key) ? key : [key];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await fetcher();
      if (options.validate) {
        return options.validate.parse(data);
      }
      return data;
    },
    staleTime: options.revalidate ? options.revalidate * 1000 : undefined,
    gcTime: options.cache ? Infinity : undefined
  });
}

export function useP2Mutation<T, V>(
  key: string,
  mutationFn: (variables: V) => Promise<T>,
  options: FetchOptions = {}
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: V) => {
      const data = await mutationFn(variables);
      if (options.validate) {
        return options.validate.parse(data);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  });
}

// Optimized prefetching
export function useP2Prefetch<T>(
  key: string | string[],
  fetcher: () => Promise<T>
) {
  const queryClient = useQueryClient();
  const queryKey = Array.isArray(key) ? key : [key];
  
  return () => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn: fetcher
    });
  };
}
