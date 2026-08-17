"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { librariesApi, type CreateLibraryInput } from "@/lib/api/libraries.api";
import type { Library } from "@/lib/api/types";

export const librariesQueryKey = ["libraries"] as const;

export function useLibraries() {
  return useQuery({ queryKey: librariesQueryKey, queryFn: librariesApi.getAll });
}

export function useLibrary(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["library", id],
    queryFn: () => librariesApi.getById(id),
    initialData: () =>
      queryClient.getQueryData<Library[]>(librariesQueryKey)?.find((lib) => lib._id === id),
  });
}

export function useCreateLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLibraryInput) => librariesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: librariesQueryKey }),
  });
}

export function useAddBookToLibrary(libraryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => librariesApi.addBook(libraryId, bookId),
    onSuccess: (data) => {
      queryClient.setQueryData(["library", libraryId], data.library);
      queryClient.invalidateQueries({ queryKey: librariesQueryKey });
    },
  });
}

export function useRemoveBookFromLibrary(libraryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => librariesApi.removeBook(libraryId, bookId),
    onSuccess: (data) => {
      queryClient.setQueryData(["library", libraryId], data.library);
      queryClient.invalidateQueries({ queryKey: librariesQueryKey });
    },
  });
}
