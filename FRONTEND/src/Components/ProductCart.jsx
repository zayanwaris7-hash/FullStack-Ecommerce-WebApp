import React from 'react'
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";
import { formatPrice } from "../utilitis/formatcurrency.js";
import { IK_PRESETS, imageKitOptimizedUrl } from "../Lib/imagekit.js";
import { useCartStore } from "../Store/coundCart.js";
export const ProductCart = (product) => {
     const addItem=useCartStore((state)=>state.items.addItem);
  return (
    <article className="card group h-full overflow-hidden border border-base-300 bg-base-100 shadow-md transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden">
        <figure className="aspect-4/3 bg-base-300">
          {product.imageurl ? (
            <img
              src={imageKitOptimizedUrl(product.imageurl, IK_PRESETS.catalogCard)}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </figure>
        <span className="badge badge-sm absolute left-3 top-3 border-0 bg-base-100/90 text-xs font-medium text-base-content/80 backdrop-blur">
          {product.category ?? "General"}
        </span>
      </Link>
      <div className="card-body grow gap-3 p-5 text-left">
        <Link
          to={`/product/${product.slug}`}
          className="card-title line-clamp-2 text-lg transition group-hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="line-clamp-3 text-sm leading-relaxed text-base-content/70">
          {product.description}
        </p>
        <div className="card-actions mt-auto items-center justify-between border-t border-base-200 pt-4">
          <span className="text-lg font-bold tabular-nums text-base-content">
            {formatPrice(product.price, "PKR")}
          </span>
          <button
            type="button"
            onClick={() => addItem({productId:product.id,quantity:1})}
            className="btn btn-primary btn-sm gap-1 shadow"
          >
            <PlusIcon className="size-4" aria-hidden />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
