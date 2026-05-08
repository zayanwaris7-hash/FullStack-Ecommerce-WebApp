import type { UserRole } from "@/database/schema.js";
const VALID:readonly UserRole[]=["customer","admin","support"];
export function parseRole(value:unknown){
    if(typeof value === "string" && (VALID as readonly string[]).includes(value)){
        return value as UserRole;
    }
    return "customer";
}

export function isAdmin(role:UserRole){
    return role==="admin";
}

export function isStaff(role:UserRole){
    return role==="support" || role === "admin";
}