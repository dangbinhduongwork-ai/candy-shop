package com.candyshop.service;

import com.candyshop.dto.AddToCartRequest;
import com.candyshop.dto.CartItemResponse;
import com.candyshop.dto.CartResponse;
import com.candyshop.dto.CategoryResponse;
import com.candyshop.dto.ProductResponse;
import com.candyshop.dto.UpdateCartItemRequest;
import com.candyshop.entity.Cart;
import com.candyshop.entity.CartItem;
import com.candyshop.entity.Product;
import com.candyshop.entity.User;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.CartItemRepository;
import com.candyshop.repository.CartRepository;
import com.candyshop.repository.ProductRepository;
import com.candyshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private Cart getOrCreateCart(String email) {
        return cartRepository.findByUserEmail(email).orElseGet(() -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));
            Cart newCart = new Cart(user);
            return cartRepository.save(newCart);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartByUserEmail(String email) {
        Cart cart = getOrCreateCart(email);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(String email, AddToCartRequest request) {
        Cart cart = getOrCreateCart(email);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new BadRequestException("Sản phẩm \"" + product.getName() + "\" hiện đã hết hàng");
        }

        // Check if product is already in cart
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newTotalQuantity = existingItem.getQuantity() + request.getQuantity();

            if (newTotalQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Số lượng thêm vào giỏ (" + newTotalQuantity + ") vượt quá số lượng tồn kho (chỉ còn " + product.getStockQuantity() + " sản phẩm)");
            }

            existingItem.setQuantity(newTotalQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new BadRequestException("Số lượng yêu cầu (" + request.getQuantity() + ") vượt quá số lượng tồn kho (chỉ còn " + product.getStockQuantity() + " sản phẩm)");
            }

            CartItem newItem = new CartItem(cart, product, request.getQuantity());
            cart.addItem(newItem);
            cartRepository.save(cart);
        }

        Cart updatedCart = cartRepository.findByUserEmail(email).orElse(cart);
        return mapToCartResponse(updatedCart);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(String email, Long cartItemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findByIdAndCartUserEmail(cartItemId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng của bạn"));

        Product product = cartItem.getProduct();

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new BadRequestException("Số lượng cập nhật (" + request.getQuantity() + ") vượt quá số lượng tồn kho (chỉ còn " + product.getStockQuantity() + " sản phẩm)");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng"));

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(String email, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findByIdAndCartUserEmail(cartItemId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong giỏ hàng của bạn"));

        Cart cart = cartItem.getCart();
        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.clearItems();
        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        int totalItems = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                Product p = item.getProduct();
                CategoryResponse categoryResp = null;
                if (p.getCategory() != null) {
                    categoryResp = new CategoryResponse(
                            p.getCategory().getId(),
                            p.getCategory().getName(),
                            p.getCategory().getDescription()
                    );
                }

                ProductResponse productResp = new ProductResponse(
                        p.getId(),
                        p.getName(),
                        p.getDescription(),
                        p.getPrice(),
                        p.getStockQuantity(),
                        categoryResp,
                        p.getImageUrl(),
                        p.getCreatedAt(),
                        p.getUpdatedAt()
                );

                BigDecimal unitPrice = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                totalItems += item.getQuantity();
                totalAmount = totalAmount.add(subtotal);

                itemResponses.add(new CartItemResponse(
                        item.getId(),
                        productResp,
                        item.getQuantity(),
                        unitPrice,
                        subtotal
                ));
            }
        }

        return new CartResponse(cart.getId(), itemResponses, totalItems, totalAmount);
    }
}
