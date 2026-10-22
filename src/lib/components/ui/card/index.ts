import Card from './Card.svelte';
import CardHeader from './CardHeader.svelte';
import CardTitle from './CardTitle.svelte';
import CardDescription from './CardDescription.svelte';
import CardContent from './CardContent.svelte';
import CardFooter from './CardFooter.svelte';

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	// Compound namespace for shadcn standard <Card.Root>, <Card.Header>, etc.
	Card as Root,
	CardHeader as Header,
	CardTitle as Title,
	CardDescription as Description,
	CardContent as Content,
	CardFooter as Footer
};

export default Card;
