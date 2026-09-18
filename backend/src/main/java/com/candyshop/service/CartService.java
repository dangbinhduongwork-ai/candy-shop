package com.candyshop.service;

import com.candyshop.dto.AddToCartRequest;
import com.candyshop.dto.CartResponse;
import com.candyshop.dto.UpdateCartItemRequest;

public interface CartService {
    CartResponse getCartByUserEmail(String email);
    CartResponse addItemToCart(String email, AddToCartRequest request);
    CartResponse updateItemQuantity(String email, Long cartItemId, UpdateCartItemRequest request);
    CartResponse removeItemFromCart(String email, Long cartItemId);
    CartResponse clearCart(String email);
}
