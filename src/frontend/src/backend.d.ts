import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cow {
    id: bigint;
    ownerId: Principal;
    name: string;
    createdAt: bigint;
    photoUrl?: string;
    breed?: string;
}
export interface Calf {
    id: bigint;
    birthDate: string;
    ownerId: Principal;
    name: string;
    createdAt: bigint;
    photoUrl?: string;
    gender: string;
    notes?: string;
    motherCowId: bigint;
}
export interface HeatRecord {
    id: bigint;
    month: string;
    ownerId: Principal;
    date: string;
    createdAt: bigint;
    cowId: bigint;
    notes?: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCalf(name: string, birthDate: string, gender: string, motherCowId: bigint, notes: string | null, photoUrl: string | null): Promise<bigint>;
    addCow(name: string, breed: string | null, photoUrl: string | null): Promise<bigint>;
    addHeatRecord(cowId: bigint, date: string, month: string, notes: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCalf(id: bigint): Promise<void>;
    deleteCow(id: bigint): Promise<void>;
    deleteHeatRecord(id: bigint): Promise<void>;
    getCalf(id: bigint): Promise<Calf>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCow(id: bigint): Promise<Cow>;
    getCowHeatRecords(cowId: bigint): Promise<Array<HeatRecord>>;
    getHeatRecord(id: bigint): Promise<HeatRecord>;
    getMyCalves(): Promise<Array<Calf>>;
    getMyCows(): Promise<Array<Cow>>;
    getMyHeatRecords(): Promise<Array<HeatRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCalf(id: bigint, name: string, birthDate: string, gender: string, motherCowId: bigint, notes: string | null, photoUrl: string | null): Promise<void>;
    updateCow(id: bigint, name: string, breed: string | null, photoUrl: string | null): Promise<void>;
    updateHeatRecord(id: bigint, cowId: bigint, date: string, month: string, notes: string | null): Promise<void>;
}
