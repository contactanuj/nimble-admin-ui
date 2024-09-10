import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  wishlist: localStorage.getItem("wishlistItems")
    ? JSON.parse(localStorage.getItem("wishlistItems"))
    : [],
};

const wishlistReducer = createReducer(initialState, (builder) => {
  builder
    // Add to wishlist
    .addCase('addToWishlist', (state, action) => {
      const item = action.payload;
      const isItemExist = state.wishlist.find((i) => i._id === item._id);
      if (isItemExist) {
        state.wishlist = state.wishlist.map((i) => 
          i._id === isItemExist._id ? item : i
        );
      } else {
        state.wishlist.push(item);
      }
    })
    // Remove from wishlist
    .addCase('removeFromWishlist', (state, action) => {
      state.wishlist = state.wishlist.filter((i) => i._id !== action.payload);
    });
});

export default wishlistReducer;