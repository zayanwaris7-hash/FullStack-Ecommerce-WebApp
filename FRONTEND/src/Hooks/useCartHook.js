import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "../Store/coundCart.js";
import { apiFetch } from "../Lib/api.js";
import { useAuth } from "@clerk/react";
import { useState } from "react";


export const useCartHook = () => {
    const { getToken } = useAuth();
    const items = useCartStore((s) => s.items);
    const setQuantity = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const [isCheckOutLink,setcheckOutLink]=useState(false);

    const { data, isLoading: ProductLoading, isError: ProductError } = useQuery({
        queryKey: ["Products"],
        queryFn: () => apiFetch("/api/product", { getToken }),
        enabled: items.length > 0
    });

    const product = data?.product ?? [];
    const byIdMap = new Map(product.map((p)=>[p.id,p]));
    const lines= items.map((item)=>({
        item,
        product:byIdMap.get(item.productId)??null,
    }));

   const subTotal= lines.reduce((sum ,{item,product})=>{
        if(!product) return sum;
        return sum+(product.price * item.quantity);
    },0);

    async function getcheckOutLink(){
        setcheckOutLink(true);
        const body={
            items:items.map((i)=>({productId:i.productId,quantity:i.quantity}))
        }
        const {data,isLoading,isError}=useQuery({
            queryKey:["CheckOutLink"],
            queryFn:()=>apiFetch("api/checkOut",{
                getToken,
                method:"POST",
                body
            })
        });
        if (data?.checkOutUrl) {
          window.location.href = data.checkOutUrl;
          return;
        }
        setcheckOutLink(false);
    }

    return {
        items,
        setQuantity,
        removeItem,
        ProductLoading,
        ProductError,
        getcheckOutLink,
        isCheckOutLink,
        subTotal,
        lines
    }

}