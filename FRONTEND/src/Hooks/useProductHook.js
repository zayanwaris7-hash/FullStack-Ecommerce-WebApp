import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../Lib/api";

function useProductHook() {
    const { getToken } = useAuth();
    const { slug } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["product", slug],
        enabled: !!slug,
        queryFn: () =>
            apiFetch(`/api/product/${slug}`, { getToken }),
    });

    return {
        product: data?.product,
        isLoading,
        error,
    };
}

export default useProductHook;