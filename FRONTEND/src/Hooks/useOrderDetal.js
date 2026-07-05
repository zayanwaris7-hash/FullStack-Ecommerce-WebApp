//id, order, items, paid, isLoading, error

import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { apiFetch } from "../Lib/api";

function useOrderDetal() {
      const {getToken}=useAuth();
      const {id} =useParams();
      const {data,isLoading,error}=useQuery({
        queryKey:["Order",id],
        queryFn:()=>apiFetch(`/api/orderRoute/${id}`,{getToken}),
        enabled:Boolean(id)
      });
      const order=data?.order??null;
      const items=data?.items??null;
      const paid=order?.status==="processing";

  return {
    id,
    order,
    items,
    isLoading,
    error
  }
}

export default useOrderDetal