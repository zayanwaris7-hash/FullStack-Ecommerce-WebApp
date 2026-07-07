//isLoading, error, orders, staff
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../Lib/api.js";
function useOrdersPage() {

   const {getToken ,isSignedIn}=useAuth();
   const {data:Data,isLoading:orderLoading,error:orderError}=useQuery({
    queryKey:["Orders"],
    queryFn:()=>apiFetch("/api/orderRoute",{getToken}),
    enabled:isSignedIn
   });
   const {data:User,isLoading:UserLoading,error:UserError}=useQuery({
    queryKey:["User"],
    queryFn:()=>apiFetch("/api/me",{getToken}),
    enabled:isSignedIn
   });
   const staff=(User?.role??"")==="support"||(User?.role??"")==="admin";
   const orders=Data?.orders??[];
  

  return {
    staff,
    orders,
    orderLoading,
    orderError
  }

}

export default useOrdersPage