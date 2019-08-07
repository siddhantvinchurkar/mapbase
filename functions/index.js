const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.locationCounter = functions.https.onRequest((request, response) => {
	var p = 0;
	var a = 0;
	admin.firestore().collection('locations').get().then(querySnapshot => {
		querySnapshot.forEach(doc => {
			if (doc.data().status) a++;
			else p++;
		});
		admin.firestore().doc('locations/counters').update({
			pending: p,
			approved: a,
			total: p + a
		}).then(documentSnapshot => {
			console.log('Done!' + documentSnapshot);
			response.send("Done!");
			return true;
		}).catch(error1 => {
			console.log(error1);
			response.send(error1);
			return false;
		});
		response.send("Done!");
		return true;
	}).catch(error => {
		console.log(error);
		response.send(error);
		return false;
	});
});


exports.fixLinks = functions.storage.object().onFinalize(async (object) => {
	const geojson_url = 'https://firebasestorage.googleapis.com/v0/b/india-plog-run.appspot.com/o/' + encodeURIComponent(object.name) + '?alt=media&token=' + object.metadata.firebaseStorageDownloadTokens;
	admin.firestore().collection('locations').where('map_number', '==', object.name.substring(14, object.name.length - 5)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (doc.data().map_number === object.name.substring(14, object.name.length - 5)) {
				admin.firestore().doc('locations/' + doc.id).update({ geojson_link: geojson_url });
			}
		});
		console.log('Done!');
		return true;
	}).catch((error) => { console.log(error); return false; });
});