import { create } from "zustand"
import { persist,createJSONStorage } from "zustand/middleware"
export const useCartStore = create(persist((set, get) => ({
    items: [],

    addItem: (productId, quantity) => {
        const { items } = get();
        const exsisting = items.find((i) => i.productId === productId);
        if (exsisting) {
            set({
                items: items.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity + quantity } 
                        : item
                ),
            });
        } else {
            set({items: [...items, { productId, quantity }]});
        }
    },


    reduceQuantity:(productId)=>{
        const {items}=get();
        set({items:items.map((item)=>item.productId===productId?{...item,quantity:item.quantity-1}:item)});
    },
    increaseQuantity:(productId)=>{
        const {items}=get();
        set({items:items.map((item)=>item.productId===productId?{...item,quantity:item.quantity+1}:item)});
    },
    
    removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

    clearItems: ()=>set({items:[]})
}), 
{ 
    name: "Cart",
    storage: createJSONStorage(() => localStorage),
 
}
));