import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

const productReducer = createReducer(initialState, (builder) => {
  builder
    // Create product
    .addCase('productCreateRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('productCreateSuccess', (state, action) => {
      state.isLoading = false;
      state.product = action.payload;
      state.success = true;
    })
    .addCase('productCreateFail', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.success = false;
    })
    // Get all products of shop
    .addCase('getAllProductsShopRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('getAllProductsShopSuccess', (state, action) => {
      state.isLoading = false;
      state.products = action.payload;
    })
    .addCase('getAllProductsShopFailed', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    // Delete product of a shop
    .addCase('deleteProductRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('deleteProductSuccess', (state, action) => {
      state.isLoading = false;
      state.message = action.payload;
    })
    .addCase('deleteProductFailed', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    // Get all products
    .addCase('getAllProductsRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('getAllProductsSuccess', (state, action) => {
      state.isLoading = false;
      state.allProducts = action.payload;
    })
    .addCase('getAllProductsFailed', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    // Fetch product details by ID
    .addCase('fetchProductDetailsRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('fetchProductDetailsSuccess', (state, action) => {
      state.isLoading = false;
      state.productDetails = action.payload;
    })
    .addCase('fetchProductDetailsFail', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    // Update product by ID
    .addCase('updateProductRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('updateProductSuccess', (state, action) => {
      state.isLoading = false;
      state.updatedProduct = action.payload;
      state.success = true;
    })
    .addCase('updateProductFail', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.success = false;
    })
    // Clear errors
    .addCase('clearErrors', (state) => {
      state.error = null;
    });
});

export default productReducer;
