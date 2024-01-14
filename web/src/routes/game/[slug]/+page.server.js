import { db } from '$lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function load({ params }) {
	const docRef = doc(db, 'games', params.slug);
	try {
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			return {
				...docSnap.data()
			};
		} else {
			console.log('No such document!');
		}
	} catch (error) {
		console.error('Error fetching data: ', error);
	}
}
