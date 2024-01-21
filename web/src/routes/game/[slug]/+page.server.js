import { db } from '$lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function load({ params }) {
	return {
		gameId: params.slug
	};
}
