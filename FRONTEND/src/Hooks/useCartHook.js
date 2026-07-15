import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "../Store/coundCart.js";
import { apiFetch } from "../Lib/api.js";
import { useAuth } from "@clerk/react";
import { useState } from "react";


export const useCartHook = () => {
    const { getToken } = useAuth();
    const items = useCartStore((s) => s.items);
    const inc = useCartStore((s) => s.increaseQuantity);
    const decr = useCartStore((s) => s.reduceQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const [isCheckOutLink,setcheckOutLink]=useState(false);

    const { data, isLoading: ProductLoading, isError: ProductError } = useQuery({
        queryKey: ["Products"],
        queryFn: () => apiFetch("/api/product", { getToken }),
        enabled: items.length > 0
    });

    const product = data?.product?? [];
    const byIdMap = new Map(product.map((p)=>[p.id,p]));
    const lines= items.map((item)=>({
        item,
        product:byIdMap.get(item.productId)??null,
    }));
   const subTotal= lines.reduce((sum ,{item,product})=>{
        if(!product) return sum;
        return sum+(product.price * item.quantity);
    },0);
 async function getcheckOutLink() {
    setcheckOutLink(true);

      try{
        const data = await apiFetch("/api/checkOut", {
            getToken,
            method: "POST",
            body: {
                items: items.map((i) => ({
                    productId: i.productId ,
                    quantity: i.quantity ,
                })),
            },
        });
        console.log("data : ",data);
        if(!data){
            console.log("data error")
        }

        if (data?.checkOutUrl){
            window.location.href = data.checkOutUrl;
            return;
        }
     } finally {
        setcheckOutLink(false);
     }
    }

    return {
        items,
        inc,
        decr,
        removeItem,
        ProductLoading,
        ProductError,
        getcheckOutLink,
        isCheckOutLink,
        subTotal,
        lines
    }

}