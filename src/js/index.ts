//#region State
import * as Const from './const';
const products = Const.products;

const $base = document.querySelector(`base`);
const baseHref = $base?.getAttribute(`href`) || `/`;
const productsById = products.reduce((productsById, product) => {
	productsById[product.id] = product;
	return productsById;
}, {});

const cacheKey = `cart`;
const cache = tryOrNull(() => JSON.parse(localStorage.getItem(cacheKey))) || {};

function cacheSet() {
	localStorage.setItem(cacheKey, JSON.stringify(cache));
}

function cacheClear() {
	for (const property in cache) {
		delete cache[property];
	}
	cacheSet();
}

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
		cartProductsById: {},
		totalCost: 0,
		totalQuantity: 0,
	};

	for (const [productId, quantity] of Object.entries(cache)) {
		const cartProduct = {
			...productsById[productId],
			quantity,
		};
		cartProduct.cost = (cartProduct.price * cartProduct.quantity);
		state.cartProductsById[productId] = cartProduct;
		state.totalQuantity += cartProduct.quantity;
		state.totalCost += cartProduct.cost;
	}

	$cartCounter.textContent = state.totalQuantity === 0 ? '' : state.totalQuantity;

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
		$cartTotal.textContent = state.totalCost;
	}
}

//#endregion

//#region Util
function tryOrNull(callback) {
	try {
		return callback();
	} catch {
		return null;
	}
}

//#endregion

//#region Handlers

window.handleAddtocart = function(event, productId, increment = 1) {
	const $button = event.currentTarget;

	if ($button.getAttribute(`disabled`) === `disabled`) {
		return;
	}

	$button.setAttribute(`disabled`, `disabled`);

	setTimeout(() => {
		cache[productId] = (cache[productId] || 0) + increment;
		if (cache[productId] <= 0) {
			delete cache[productId];
		}
		cacheSet();
		render();
		$button.removeAttribute(`disabled`);
	}, latency);
}

window.handleCartClear = function(event) {
	const $button = event.currentTarget;

	if ($button.getAttribute(`disabled`) === `disabled`) {
		return;
	}

	$button.setAttribute(`disabled`, `disabled`);
	setTimeout(() => {
		cacheClear();
		render();
		$button.removeAttribute(`disabled`);
	}, latency);
}

window.handleCheckout = function(event) {
	const $button = event.currentTarget;

	if ($button.getAttribute(`disabled`) === `disabled`) {
		return;
	}

	$button.setAttribute(`disabled`, `disabled`);
	setTimeout(() => {
		cacheClear();
		location.href = `${baseHref}thanks`;
	}, latency);
}
//#endregion
