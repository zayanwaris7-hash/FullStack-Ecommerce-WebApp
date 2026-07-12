import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiFetch } from "../Lib/api.js";

export function useAdminProductsPage() {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/me", { getToken }),
    enabled: isSignedIn,
  });

  const isAdmin = meData?.role === "admin";

  // 1. Fetch Products
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => apiFetch("/api/adminRoute/product", { getToken }),
    enabled: isSignedIn && isAdmin,
  });

  // 2. Fetch Categories (Ensuring admin page can access them for forms/filters)
  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch("/api/product/catogory"),
    enabled: isSignedIn && isAdmin,
  });
  const products = data?.product ?? [];
 const categories = categoryData?.catog ?? [];

  // Save Mutation (Create/Update)
  const saveMutation = useMutation({
    mutationFn: async ({ body, slug }) => {
      if (slug) {
        return apiFetch(`/api/adminRoute/product/${slug}`, {
          getToken,
          method: "POST",
          body,
        });
      }
      return apiFetch("/api/adminRoute/product", { getToken, method: "POST", body });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setModalOpen(false);
      setEditing(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (productId) =>
      apiFetch(`/api/adminRoute/product/${productId}`, { getToken, method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Delete failed");
    },
  });

  return {
    getToken,
    isSignedIn,
    meData,
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    products, // Now reading directly from the integrated Zustand state
    categories, // Available for rendering dropdown selection options in your modals
    isLoading,
    saveMutation,
    deleteMutation,
  };
}