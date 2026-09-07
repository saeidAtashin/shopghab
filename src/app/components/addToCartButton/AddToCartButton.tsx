"use client";

import { Game } from "@/lib/games";

export default function AddToCartButton({ game }: { game: Game }) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    cart.push(game);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("بازی به سبد اضافه شد");
  };

  return (
    <button
      onClick={addToCart}
      className="w-full h-11 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition"
    >
      افزودن به سبد خرید
    </button>
  );
}
