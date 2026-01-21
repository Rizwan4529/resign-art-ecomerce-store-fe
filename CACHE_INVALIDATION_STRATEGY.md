# RTK Query Cache Invalidation Strategy

## Overview

This document outlines how **cache invalidation** is implemented across the application using **RTK Query**. Cache invalidation ensures that when data is modified (via POST, PUT, DELETE), related queries are re-fetched automatically to keep the UI in sync with the backend.

## How RTK Query Cache Works

RTK Query caches API responses to avoid unnecessary re-fetches. Cache invalidation is managed through **tags**:

- **`providesTags`**: Marks what tags a query "provides" (supplies cache for)
- **`invalidatesTags`**: Specifies which tags to invalidate when a mutation completes

When a tag is invalidated, all queries that provide that tag are re-fetched.

## Tag Types Defined

```typescript
tagTypes: [
  "User", // User profiles, user lists, authentication
  "Product", // Product catalog, featured products, products by category
  "Order", // User orders, admin order management
  "Cart", // Shopping cart items and cart count
  "Inventory", // Inventory levels, stock management
  "InventoryAlert", // Low stock alerts and warnings
  "SalesReport", // Sales reports and statistics
  "Notification", // User notifications
  "Review", // Product reviews and ratings
  "Profit", // Profit/loss, expenses, budgets
];
```

## Cache Invalidation Map

### Product Management

| Mutation        | Invalidates                                        | Effect                                   |
| --------------- | -------------------------------------------------- | ---------------------------------------- |
| `createProduct` | `Product:LIST`, `Product:FEATURED`                 | New product appears in all product lists |
| `updateProduct` | `Product:{id}`, `Product:LIST`, `Product:FEATURED` | Updated product reflects everywhere      |
| `deleteProduct` | `Product:{id}`, `Product:LIST`, `Product:FEATURED` | Deleted product removed from all lists   |

### Inventory Management

| Mutation          | Invalidates                                                                                                       | Effect                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `updateInventory` | `Inventory:{id}`, `Inventory:LIST`, `InventoryAlert:ALERTS`, `Product:{id}`, `Product:LIST`, `SalesReport:REPORT` | Stock updated, product availability changes, alerts recalculate |

### Order Management

| Mutation            | Invalidates                                    | Effect                                     |
| ------------------- | ---------------------------------------------- | ------------------------------------------ |
| `createOrder`       | `Order`, `Cart`                                | New order created, cart cleared            |
| `cancelOrder`       | `Order:{id}`, `Order:LIST`, `Order:ADMIN_LIST` | Order status updated in all views          |
| `updateOrderStatus` | `Order:{id}`, `Order:LIST`, `Order:ADMIN_LIST` | Status changes visible to users and admins |

### Cart Management

| Mutation         | Invalidates | Effect                        |
| ---------------- | ----------- | ----------------------------- |
| `addToCart`      | `Cart`      | Cart updated with new item    |
| `updateCartItem` | `Cart`      | Cart quantity/details updated |
| `removeFromCart` | `Cart`      | Item removed from cart        |
| `clearCart`      | `Cart`      | All cart items cleared        |

### Review Management

| Mutation        | Invalidates                                             | Effect                                 |
| --------------- | ------------------------------------------------------- | -------------------------------------- |
| `createReview`  | `Product:{id}`, `Product:LIST`, `Review:LIST`, `User`   | Product rating updated, review appears |
| `updateReview`  | `Review:MY_LIST`, `Review:LIST`, `Product:LIST`, `User` | Review updated everywhere              |
| `deleteReview`  | `Review:LIST`, `Review:MY_LIST`, `Product:LIST`, `User` | Review removed from all views          |
| `approveReview` | `Review:LIST`, `Product:LIST`                           | Approved review appears on product     |

### Notification Management

| Mutation             | Invalidates                              | Effect                   |
| -------------------- | ---------------------------------------- | ------------------------ |
| `markAsRead`         | `Notification:{id}`, `Notification:LIST` | Read status updated      |
| `markAllAsRead`      | `Notification:LIST`                      | All marked as read       |
| `deleteNotification` | `Notification:{id}`, `Notification:LIST` | Notification removed     |
| `createNotification` | `Notification:LIST`                      | New notification appears |

### Profit/Expense Management

| Mutation     | Invalidates                                                                  | Effect                                          |
| ------------ | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| `addExpense` | `Profit:SUMMARY`, `Profit:DETAILED`, `Profit:EXPENSES`, `SalesReport:REPORT` | Profit calculations updated                     |
| `setBudget`  | `Profit:BUDGETS`, `Profit:SUMMARY`                                           | Budget limits and remaining amounts recalculate |

### User Management

| Mutation         | Invalidates | Effect                           |
| ---------------- | ----------- | -------------------------------- |
| `blockUser`      | `User`      | User list and stats updated      |
| `unblockUser`    | `User`      | User accessibility updated       |
| `updateUserRole` | `User`      | User permissions reflect changes |
| `deleteUser`     | `User`      | User removed from system         |

## Real-World Scenarios

### Scenario 1: Admin Adds Product, User Browsing Shop

1. **Admin creates product** → `createProduct` mutation fires
2. **Mutation invalidates** `Product:LIST` and `Product:FEATURED` tags
3. **User's Shop page** (which uses `getProducts` query with `Product:LIST` tag) **automatically refetches**
4. **New product appears** in user's product list

### Scenario 2: Inventory Update Affects Multiple Pages

1. **Admin updates inventory** → `updateInventory` mutation fires
2. **Mutation invalidates**: `Inventory:*`, `Product:*`, `InventoryAlert:*`, `SalesReport:*`
3. **All affected views update**:
   - Product availability on shop/home
   - Inventory dashboard
   - Low stock alerts
   - Sales report calculations

### Scenario 3: Review Affects Product Rating

1. **User creates review** → `createReview` mutation fires
2. **Mutation invalidates** `Product:{id}`, `Product:LIST`, `Review:LIST`, `User`
3. **Product detail page** shows updated rating
4. **Product list** reflects new average rating
5. **Admin review dashboard** shows pending review

## Important Notes

### Per-Client Cache Invalidation

**RTK Query cache invalidation is per-client** (per browser/device):

- When admin adds product on Device A, user on Device B won't see it automatically
- Both clients need to refetch (either manually or when navigating)
- This is handled by cache invalidation - when user navigates back to shop, fresh data is fetched

### For Real-Time Cross-Client Updates

To enable real-time updates across different devices/browsers:

1. **Use WebSockets** for pushing updates to all connected clients
2. **Use polling** to periodically refetch critical queries
3. **Combine both** for best UX

### Best Practices

✅ **DO:**

- Always specify `providesTags` on queries
- Always specify `invalidatesTags` on mutations
- Use specific tag IDs when possible: `{ type: 'Product', id: productId }`
- Invalidate parent tags (e.g., `LIST`) when creating items
- Invalidate related queries (e.g., invalidate `Product` when inventory changes)

❌ **DON'T:**

- Forget to invalidate tags when mutations complete
- Invalidate too broadly (unless necessary)
- Use generic string tags - use typed objects: `{ type: 'Product', id: 'LIST' }`
- Assume data is fresh without invalidating

## Testing Cache Invalidation

To verify cache invalidation works:

1. Open **Redux DevTools** → **RTK Query**
2. Perform a query (e.g., fetch products)
3. Perform a mutation (e.g., create product)
4. Check that:
   - ✅ Query results updated after mutation
   - ✅ No duplicate requests for non-invalidated queries
   - ✅ Correct tags are shown as invalidated

## Adding New Endpoints

When adding new API endpoints:

1. **Define clear tags** in `baseApi.ts`
2. **Add `providesTags`** to every query
3. **Add `invalidatesTags`** to every mutation
4. **Consider related data** - what else might need updating?

Example:

```typescript
// New endpoint
getCategoryProducts: builder.query({
  query: (category) => `/products/category/${category}`,
  // ✅ Provide this specific category data
  providesTags: [{ type: 'Product', id: `CATEGORY_${category}` }],
}),

// Related mutation should invalidate
updateProduct: builder.mutation({
  // ... query config
  invalidatesTags: [
    { type: 'Product', id: 'LIST' },
    // ✅ Also invalidate specific categories
    { type: 'Product', id: `CATEGORY_${category}` },
  ],
}),
```

## Debugging Cache Issues

If data isn't updating:

1. **Check tags**: Are `providesTags` and `invalidatesTags` correctly typed?
2. **Check mutation response**: Is mutation returning success?
3. **Check Redux DevTools**: Is tag being invalidated?
4. **Check query params**: Same params = same cache entry
5. **Manual refetch**: Call `refetch()` if needed temporarily

---

## Summary

This cache invalidation strategy ensures:

- ✅ Users see fresh data when available
- ✅ Efficient caching reduces API calls
- ✅ Coordinated updates across related entities
- ✅ Admin changes are reflected appropriately
- ✅ Scalable architecture for future features
