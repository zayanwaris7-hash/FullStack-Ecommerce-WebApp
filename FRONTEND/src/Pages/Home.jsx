import React from 'react';
import { useHomeCatalog } from '../Hooks/useHomeCatalog.js';
import { useSearchParams } from "react-router";
import  HomeHero  from "../Components/HomeHero.jsx";
import { TrustStrip } from '../Components/TrustStrip.jsx';
import { PageError } from '../Components/PageError.jsx';
import { ProductCart } from '../Components/ProductCart.jsx';
const Home = () => {
  const all=useHomeCatalog();



  return (
    <>
        <div className="space-y-12">
      <HomeHero categories={all.catogories} isLoading={all.isCatoLoad} />

      <TrustStrip />

      {/* CATELOG */}
      <section id="catolag" className="scroll-mt-24">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content md:text-2xl uppercase font-mono">
              Catalog
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm ${!all.category ? "btn-primary" : "btn-ghost border border-base-300"}`}
              onClick={() => all.setCategory("")}
            >
              All
            </button>

            {all.categoryChipsLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-8 w-20 rounded-lg" aria-hidden />
                ))
              : all.catogories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm ${categoryFilter === c ? "btn-primary" : "btn-ghost border border-base-300"}`}
                    onClick={() => all.setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
          </div>
        </div>

        {all.isProductLoad ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i}>
                <div className="skeleton h-96 w-full rounded-box" />
              </li>
            ))}
          </ul>
        ) : all.error ? (
          <PageError message="We couldn't load products. Please try again in a moment." />
        ) : all.products.length === 0 ? (
          <div className="rounded-box border border-base-300 bg-base-100 py-16 text-center text-base-content/60">
            No products in this category yet.
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {all.products.map((p) => (
              <li key={p.id}>
                <ProductCart product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </>
  )
}

export default Home