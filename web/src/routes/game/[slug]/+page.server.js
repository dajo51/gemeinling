import { db } from '$lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function load({ params }) {
	let data;
	const docRef = doc(db, 'games', params.slug);
	try {
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			data = docSnap.data();
			return {
				id: params.slug,
				createdAt: data.createdAt.toString(),
				maxPoints: data.maxPoints,
				players: data.players
			};
		} else {
			console.log('No such document!');
		}
	} catch (error) {
		console.error('Error fetching data: ', error);
	}
}
