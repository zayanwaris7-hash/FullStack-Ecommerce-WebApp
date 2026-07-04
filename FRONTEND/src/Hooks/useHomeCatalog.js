import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../Lib/api";

export const useHomeCatalog = () => {
   const [searchParams, setParams] = useSearchParams();
    const category = searchParams.get("catogory")?.trim() ?? "";

    const setCategory = (category) => {
        const next = new URLSearchParams(searchParams);
        if (!category) next.delete("category");
        else next.set("category", category);
        setSearchParams(next, { replace: true });
    }
    
   const {data:catogor,isLoading:isCatoLoad,error}= useQuery({
        queryKey:["categories"],
        queryFn:()=>apiFetch("/api/product/catogory"),
    });


    const {data:productData,isLoading:isProductLoad}=useQuery({
        queryKey:["productByCategory"],
        queryFn:()=>{apiFetch(category?`/api/product?category=${encodeURIComponent(category)}`:`/api/product`)}
    });

    const catogories=catogor?.catog??[];
    const products=productData?.product??[];
    const categoryChipsLoading = isCatoLoad && catogories.length === 0;


    return {
        category,
        setCategory,
        catogories,
        products,
        isCatoLoad,
        isProductLoad,
        categoryChipsLoading,
        error,
    };
}