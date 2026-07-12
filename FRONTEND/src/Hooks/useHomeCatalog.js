import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../Lib/api";

export const useHomeCatalog = () => {
    const [searchParams, setParams] = useSearchParams();
    
    // Fixed typo: matching "category" consistently
    const category = searchParams.get("category")?.trim() ?? ""; 
    

    // 1. Fetch Categories (Pulled out of useEffect)
    const { data: categoryData, isLoading: isCatoLoad, error } = useQuery({
        queryKey: ["categories"],
        queryFn: () => apiFetch("/api/product/catogory"),
    });

    // 2. Fetch Products based on selected category (Pulled out of useEffect)
    const { data: productData, isLoading: isProductLoad } = useQuery({
        queryKey: ["productByCategory", category], // Keeps track of changing categories
        queryFn: () => apiFetch(category ? `/api/product?category=${encodeURIComponent(category)}` : `/api/product`)
    });

   

    // Update URL query parameters
    const setCategory = (catName) => {
        const next = new URLSearchParams(searchParams);
        if (!catName) next.delete("category");
        else next.set("category", catName);
        setParams(next, { replace: true });
    };

    const categories=categoryData?.catog??[];
    const products=productData?.product??[];
    const categoryChipsLoading = isCatoLoad && categories.length === 0;
    return {
        category,
        setCategory,
        categories, 
        products,
        isCatoLoad,
        isProductLoad,
        categoryChipsLoading,
        error,
    };
};