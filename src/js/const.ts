const companyName = `Bluth Family Farm`;

type Product = {
	id: string;
	name: string;
	price: number;
	description: string;
}

const products: Array<Product> = [
	{
		id: `apple`,
		name: `Apple`,
		price: 5,
		description: `Fresh, crisp, and juicy! These apples are hand-picked from our centuries-old family orchard.`
	},
	{
		id: `banana`,
		name: `Banana`,
		price: 10,
		description: `Packed with energy and electrolytes like potassium, bananas are the perfect on-the-go snack.`
	},
	{
		id: `cantaloupe`,
		name: `Cantaloupe`,
		price: 20,
		description: `One slice of this delcious melon provides you with your daily nutritional value of vitamin C!`
	}
];

export {
	companyName,
	products,
}
