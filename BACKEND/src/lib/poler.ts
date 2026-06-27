import type { Env } from "./env.js";
type obj={
    id:string,
    url:string
}
type checkOutBody = {
    products: string[];
    prices?: Record<
        string,
        Array<{
            amount_type: "fixed";
            price_amount: number;
            price_currency: string;
        }>
    >;
    success_url:string;
    return_url?:string;
    external_customer_id?:string;
    customer_email?:string;
    metadata?:Record<string,string|boolean|number>
}
export async function polarCreateCheckOut(env:Env,body:checkOutBody){
    const token=env.POLER_ACCESS_TOKEN;
    if(!token) throw new Error("Polar Access Token is not configured!");
    const ress=await fetch(`${env.POLER_ACCESS_TOKEN}/v1/checkouts`,{
        method:"POST",
        headers:{
            Authorization : `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body:JSON.stringify(body),
    });
    if(!ress.ok){
        const txt=await ress.text();
        throw new Error(`Polar Access error : ${txt}`);
    }
    const data=(await ress.json()) as obj;
    return data;
}
