import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Calf, Cow, HeatRecord } from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetMyCows() {
  const { actor, isFetching } = useActor();
  return useQuery<Cow[]>({
    queryKey: ["myCows"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCows();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      breed: string | null;
      photoUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCow(params.name, params.breed, params.photoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCows"] });
    },
  });
}

export function useUpdateCow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      breed: string | null;
      photoUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCow(
        params.id,
        params.name,
        params.breed,
        params.photoUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCows"] });
    },
  });
}

export function useDeleteCow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCow(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCows"] });
    },
  });
}

export function useGetCowHeatRecords(cowId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<HeatRecord[]>({
    queryKey: ["cowHeatRecords", cowId?.toString()],
    queryFn: async () => {
      if (!actor || cowId === null) return [];
      return actor.getCowHeatRecords(cowId);
    },
    enabled: !!actor && !isFetching && cowId !== null,
  });
}

export function useAddHeatRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      cowId: bigint;
      date: string;
      month: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addHeatRecord(
        params.cowId,
        params.date,
        params.month,
        params.notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cowHeatRecords", variables.cowId.toString()],
      });
    },
  });
}

export function useUpdateHeatRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      cowId: bigint;
      date: string;
      month: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateHeatRecord(
        params.id,
        params.cowId,
        params.date,
        params.month,
        params.notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cowHeatRecords", variables.cowId.toString()],
      });
    },
  });
}

export function useDeleteHeatRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: bigint; cowId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteHeatRecord(params.id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cowHeatRecords", variables.cowId.toString()],
      });
    },
  });
}

// Calf hooks
export function useGetMyCalves() {
  const { actor, isFetching } = useActor();
  return useQuery<Calf[]>({
    queryKey: ["myCalves"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCalves();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCalf() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      birthDate: string;
      gender: string;
      motherCowId: bigint;
      notes: string | null;
      photoUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCalf(
        params.name,
        params.birthDate,
        params.gender,
        params.motherCowId,
        params.notes,
        params.photoUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCalves"] });
    },
  });
}

export function useUpdateCalf() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      birthDate: string;
      gender: string;
      motherCowId: bigint;
      notes: string | null;
      photoUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCalf(
        params.id,
        params.name,
        params.birthDate,
        params.gender,
        params.motherCowId,
        params.notes,
        params.photoUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCalves"] });
    },
  });
}

export function useDeleteCalf() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCalf(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCalves"] });
    },
  });
}
