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

const cartCache = new Cache(`cart`, {} as Record<Const.Product[`id`], number>);
const settingsCache = new Cache(`settings`, {
	order: null as Array<Const.Product[`id`]>,
});
//#endregion

//#region View
const latency = 300;
const varMatcher = /\[\[\s*(.*?)\s*\]\]/g;

const $cartCounter = document.querySelector(`[data-cart-counter]`);
const $cartProducts = document.querySelector(`[data-cart-products]`);
const $cartProductTemplate = document.querySelector(`[data-cart-product-template]`);
const $cartTotal = document.querySelector(`[data-cart-total]`);
const $productCards = Array.from(document.querySelectorAll(`[data-product-display]`));

const cartProductTemplate = $cartProductTemplate?.innerHTML;

render();

if (!settingsCache.val.order) {
	settingsCache.val.order = products
		.map((product) => ({ value: product.id, order: Math.random() }))
		.sort((a, b) => a.order - b.order)
		.map(({ value }) => value);
	settingsCache.persist();
}

if ($productCards.length > 0) {
	const $productCardsById = $productCards.reduce(($productCardsById, $productCard) => {
		const productId = $productCard.getAttribute(`data-product-display`);
		$productCardsById[productId] = $productCard;
		return $productCardsById;
	}, {} as Record<string, Element>);

	const $parent = $productCards[0].parentElement;
	$parent.innerHTML = ``;

	for (const productId of settingsCache.val.order) {
		$parent.appendChild($productCardsById[productId]);
	}
}

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

	if ($cartProducts && settingsCache.val.order) {
		let innerHTML = ``;
		for (const productId of settingsCache.val.order) {
			const cartProduct = state.cartProductsById[productId];
			if (!cartProduct) {
				continue;
			}

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
