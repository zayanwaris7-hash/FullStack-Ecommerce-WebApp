import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiFetch } from "../Lib/api";

//product is load error
function useProductHook() {

    const {getToken}=useAuth();
    const {slug} =useParams();
    const {data,isLoading,error}=useQuery({
        queryKey:["Product"],
        queryFn:()=>apiFetch(`/api/product/${slug}`,{getToken})
    });
    const product=data?.product??{};
    return  {
        product,
        isLoading,
        error
    };
  
}

export default useProductHook