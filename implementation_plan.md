# Implementation Plan - Customer Accounts & Premium Features

Enhance the **LUV Store** web application by adding customer authentication, unified profiles (with default shipping addresses), order history lookups, favorite items (wishlist), and database-synchronized shopping carts.

## User Review Required

> [!IMPORTANT]
> **Admin and Customer Split Auth**
> * New signups will default to the **Customer** role. We will update the database trigger `on_auth_user_created` so that any signup with metadata `role: 'admin'` gets added to `admin_profiles`, and all other signups get added to a new `user_profiles` table.
> * Existing admin credentials created via the Supabase user dashboard will remain unaffected, but new customer signups will populate the customer database.

> [!TIP]
> **Additional Suggested Updates**
> * **Persisted Cart Syncing**: When a logged-in user adds items to their cart, we will sync it with a database `cart_items` table so that if they log in from another browser/phone, their cart is preserved.
> * **Default Addresses**: Customers can save their Shipping Address, pre-filling the Checkout page form.
> * **Interactive Wishlist**: Add a heart icon to products so users can build a favorites list.

---

## Proposed Changes

### 1. Database Schema Updates
We will add new tables and modify the existing tables to support customer mappings.

#### [MODIFY] [schema.sql](file:///k:/projects/business/schema.sql)
* Create `user_profiles` table referencing `auth.users(id)`.
* Create `favorites` table linking `user_id` and `product_id` with a unique index.
* Create `cart_items` table linking `user_id` and `product_id` to hold quantities.
* Add `user_id` (UUID referencing `auth.users(id)`) as an optional column to `orders` table (allows guest checkout vs. registered customer checks).
* Update `handle_new_user` database function to route admins vs. customer profiles based on metadata.

---

### 2. Backend Enhancements
Add controller endpoints and routes for customers.

#### [NEW] [backend/controllers/customerController.js](file:///k:/projects/business/backend/controllers/customerController.js)
* Implement `getCustomerProfile` and `updateCustomerProfile` (phone, address, pincode details).
* Implement `getFavorites` / `addFavorite` / `removeFavorite` wishlist utilities.
* Implement `getDbCart` / `syncCartWithDb` to handle syncing of items.
* Implement `getCustomerOrders` to return all orders matching the logged-in customer's `user_id`.

#### [NEW] [backend/routes/customerRoutes.js](file:///k:/projects/business/backend/routes/customerRoutes.js)
* Register endpoints:
  - GET & PUT `/customer/profile` (auth protected)
  - GET & POST & DELETE `/customer/favorites` (auth protected)
  - GET & POST `/customer/cart` (auth protected)
  - GET `/customer/orders` (auth protected)

#### [MODIFY] [backend/server.js](file:///k:/projects/business/backend/server.js)
* Mount `/api/customer` routes.

---

### 3. Frontend Enhancements
Introduce login screens, heart elements, and address pre-filling.

#### [NEW] [frontend/src/pages/CustomerLogin.jsx](file:///k:/projects/business/frontend/src/pages/CustomerLogin.jsx)
* User signup and login forms utilizing Supabase authentication directly or via backend. Since backend can act as proxy, we'll implement login/signup proxies or let client connect to Supabase Auth client directly (we'll implement client-side direct auth using supabase-js, which is standard, or backend endpoints). Let's use backend proxy for unified authorization.

#### [NEW] [frontend/src/pages/MyOrders.jsx](file:///k:/projects/business/frontend/src/pages/MyOrders.jsx)
* Displays a list of historical orders for the logged-in customer, showing status, details, and items.

#### [NEW] [frontend/src/pages/Favorites.jsx](file:///k:/projects/business/frontend/src/pages/Favorites.jsx)
* Renders the customer's liked/favorited products collection.

#### [MODIFY] [frontend/src/context/AuthContext.jsx](file:///k:/projects/business/frontend/src/context/AuthContext.jsx)
* Expand the context to manage a `user` state (alongside `admin`) and expose `customerLogin`, `customerRegister`, and `customerLogout`.

#### [MODIFY] [frontend/src/context/CartContext.jsx](file:///k:/projects/business/frontend/src/context/CartContext.jsx)
* Update cart context to trigger a DB sync request to the backend `/customer/cart` endpoint when a user is logged in.

#### [MODIFY] [frontend/src/components/Navbar.jsx](file:///k:/projects/business/frontend/src/components/Navbar.jsx)
* Add a profile dropdown for logged-in users with options: "My Orders", "Favorites", "Logout". Show a login link for guest users.

#### [MODIFY] [frontend/src/components/ProductCard.jsx](file:///k:/projects/business/frontend/src/components/ProductCard.jsx)
* Integrate a working heart icon toggler that hits the favorites endpoint.

#### [MODIFY] [frontend/src/pages/Checkout.jsx](file:///k:/projects/business/frontend/src/pages/Checkout.jsx)
* Pre-fill the shipping details fields using the customer's profile if logged in. Include `user_id` in the submitted order data.

---

## Verification Plan

### Manual Verification
- **Sign Up / Sign In**: Register a new customer user, verify that a `user_profiles` row is created, and log in.
- **Wishlist Test**: Heart a product, verify it appears in "Favorites" page, unheart it, and check that it's removed.
- **Cart Sync Test**: Add items to the cart, log out, clear local storage, log back in, and verify the cart is restored from the database.
- **My Orders Test**: Place an order while logged in. Verify the order is linked to the user account and appears under "My Orders".
