//#region State
import { Cache } from './cache';
import * as Const from './const';

const products = Const.products;

const $base = document.querySelector(`base`);
const baseHref = $base?.getAttribute(`href`) || `/`;
const productsById = products.reduce((productsById, product) => {
	productsById[product.id] = product;
	return productsById;
}, {});

const cartCache = new Cache<Record<Const.Product[`id`], number>>(`cart`);

//#endregion

//#region View
const latency = 300;
const varMatcher = /\[\[\s*(.*?)\s*\]\]/g;

const $cartCounter = document.querySelector(`[data-cart-counter]`);
const $cartProducts = document.querySelector(`[data-cart-products]`);
const $cartProductTemplate = document.querySelector(`[data-cart-product-template]`);
const $cartTotal = document.querySelector(`[data-cart-total]`);

const cartProductTemplate = $cartProductTemplate?.innerHTML;

render();

function render() {
	const state = {
		cartProductsById: {} as Record<Const.Product[`id`], Const.Product>,
		totalCost: 0,
		totalQuantity: 0,
	};

	for (const [productId, quantity] of Object.entries(cartCache.val)) {
		const cartProduct = {
			...productsById[productId],
			quantity,
		};
		cartProduct.cost = (cartProduct.price * cartProduct.quantity);
		state.cartProductsById[productId] = cartProduct;
		state.totalQuantity += cartProduct.quantity;
		state.totalCost += cartProduct.cost;
	}

	$cartCounter.textContent = `${state.totalQuantity === 0 ? '' : state.totalQuantity}`;

	if ($cartProducts) {
		let innerHTML = ``;
		const cartProducts = Object.values(state.cartProductsById).sort((a, b) => a.id > b.id ? 1 : -1);
		for (const cartProduct of cartProducts) {
			innerHTML += cartProductTemplate.replace(varMatcher, (_nil, property) => {
				return cartProduct[property];
			});
		}
		$cartProducts.innerHTML = innerHTML;
	}

	if ($cartTotal) {
		$cartTotal.textContent = `${state.totalCost}`;
	}
}

//#endregion

//#region Handlers
Object.assign(window, {
	handleAddtocart: (
		event: MouseEvent,
		productId: Const.Product[`id`],
		increment = 1,
	) => {
		const $button = event.currentTarget as HTMLButtonElement;

		if ($button.getAttribute(`disabled`) === `disabled`) {
			return;
		}

		$button.setAttribute(`disabled`, `disabled`);

		setTimeout(() => {
			cartCache.val[productId] = (cartCache.val[productId] || 0) + increment;
			if (cartCache.val[productId] <= 0) {
				delete cartCache.val[productId];
			}
			cartCache.persist();
			render();
			$button.removeAttribute(`disabled`);
		}, latency);
	},

	handleCartClear: (event: MouseEvent) => {
		const $button = event.currentTarget as HTMLButtonElement;

		if ($button.getAttribute(`disabled`) === `disabled`) {
			return;
		}

		$button.setAttribute(`disabled`, `disabled`);
		setTimeout(() => {
			cartCache.clear();
			render();
			$button.removeAttribute(`disabled`);
		}, latency);
	},

	handleCheckout: (event: MouseEvent) => {
		const $button = event.currentTarget as HTMLButtonElement;

		if ($button.getAttribute(`disabled`) === `disabled`) {
			return;
		}

		$button.setAttribute(`disabled`, `disabled`);
		setTimeout(() => {
			cartCache.clear();
			location.href = `${baseHref}thanks`;
		}, latency);
	},
});
//#endregion
