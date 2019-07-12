/* Global Variables */
var db = null;
var user = null;
var signedIn = false;
var filter_map_number = '';
var filter_map_name = '';
var filter_location = '';
var filter_circuit_distance = false;
var filter_status = false;
var filter_timestamp = true;
var unsubscribe = null;
var filters = false;
var autoCompleteList = {};
var map = null;
var link_data = null;
var storage = null;
var current_files = [];
var file_string = [];
var uploadTask = [];
var fileIndex = 0;
var globalIndex = 0;
var downloadURLList = [];
var lmt = 25;
var current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var os = [
	{ name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
	{ name: 'Windows', value: 'Win', version: 'NT' },
	{ name: 'iPhone', value: 'iPhone', version: 'OS' },
	{ name: 'iPad', value: 'iPad', version: 'OS' },
	{ name: 'Kindle', value: 'Silk', version: 'Silk' },
	{ name: 'Android', value: 'Android', version: 'Android' },
	{ name: 'PlayBook', value: 'PlayBook', version: 'OS' },
	{ name: 'BlackBerry', value: 'BlackBerry', version: '/' },
	{ name: 'Macintosh', value: 'Mac', version: 'OS X' },
	{ name: 'Linux', value: 'Linux', version: 'rv' },
	{ name: 'Palm', value: 'Palm', version: 'PalmOS' }
];
var browser = [
	{ name: 'Chrome', value: 'Chrome', version: 'Chrome' },
	{ name: 'Firefox', value: 'Firefox', version: 'Firefox' },
	{ name: 'Safari', value: 'Safari', version: 'Version' },
	{ name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
	{ name: 'Opera', value: 'Opera', version: 'Opera' },
	{ name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
	{ name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
];

var header = [
	navigator.platform,
	navigator.userAgent,
	navigator.appVersion,
	navigator.vendor,
	window.opera
];

/* Identity RegEx Function */
function matchItem(string, data) {
	var i = 0,
		j = 0,
		html = '',
		regex,
		regexv,
		match,
		matches,
		version;
	for (i = 0; i < data.length; i += 1) {
		regex = new RegExp(data[i].value, 'i');
		match = regex.test(string);
		if (match) {
			regexv = new RegExp(data[i].version + '[- /:;]([\d._]+)', 'i');
			matches = string.match(regexv);
			version = '';
			if (matches) {
				if (matches[1]) {
					matches = matches[1];
				}
			}
			if (matches) {
				matches = matches.split(/[._]+/);
				for (j = 0; j < matches.length; j += 1) {
					if (j === 0) {
						version += matches[j] + '.';
					}
					else {
						version += matches[j];
					}
				}
			}
			else {
				version = '0';
			}
			return {
				name: data[i].name,
				version: parseFloat(version)
			};
		}
	}
	return { name: 'unknown', version: 0 };
}

/* Retrieve device identity */
function getDeviceIdentity() {
	agent = header.join(' ');
	os = this.matchItem(agent, os);
	browser = this.matchItem(agent, browser);
}

/* Get date string from timestamp (color-coded) */
function generateColorCodedDateString(date, dateColor, timeColor, dateBool = true, timeBool = true) {
	date = date.toDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (dateBool && !timeBool) return '<span style="font-weight:bolder; color:' + dateColor + ';">' + month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + '</span>';
	else if (timeBool && !dateBool) return '<span style="font-weight:bolder; color:' + timeColor + ';">' + hours + ':' + minutes + '</span>';
	else return '<span style="font-weight:bolder; color:' + dateColor + ';">' + month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + '</span><span style="font-weight:bolder; color:' + timeColor + ';">' + hours + ':' + minutes + '</span>';
}

function initializeUI() {

	// Set the footer year
	document.getElementById('footer_year').innerHTML = new Date().getFullYear();

	// Initialize materialize tootips
	$('.tooltipped').tooltip();

	// Initialize materialize selects
	$('select').formSelect();

	// Initialize materialize autocompletes
	$('input.autocomplete').autocomplete({
		data: autoCompleteList
	});

	//Initialize materialize modals
	$('.modal').modal();

}

/* Sign In Function */
function signIn() {

	var provider = new firebase.auth.GoogleAuthProvider();
	if (!signedIn) {
		getDeviceIdentity();
		firebase.auth().signInWithPopup(provider).then(function (result) {
			user = result.user;
			var tempCounter = 0;
			db.collection('users').where('email', '==', user.email).get().then(function (querySnapshot) {
				querySnapshot.forEach((doc) => {
					currentUserDocId = doc.id;
					tempCounter++;
				});
				if (tempCounter < 1) {
					returningUser = false;
					db.collection('users').add({
						displayName: user.displayName,
						email: user.email,
						photoURL: user.photoURL
					}).then(function (doc) {
						currentUserDocId = doc.id;
					});
					db.collection('users').doc(currentUserDocId).collection('activity_logs').add({
						timestamp: new Date(),
						os_name: os.name,
						os_version: os.version,
						browser_name: browser.name,
						browser_version: browser.version
					});
				}
				else {
					returningUser = true;
					db.collection('users').doc(currentUserDocId).collection('activity_logs').add({
						timestamp: new Date(),
						os_name: os.name,
						os_version: os.version,
						browser_name: browser.name,
						browser_version: browser.version
					});
				}
			});
			signedIn = true;
			setTimeout(function () {

				$("#screen_login").fadeOut(500);
				setTimeout(function () { $("#screen_intro").fadeIn(500); }, 600);
				document.getElementById('username').innerHTML = user.displayName;
				document.getElementById('btn_login').innerHTML = '<i class="material-icons left" style = "margin-top: -0.6em !important;" > exit_to_app</i > Logout';

			}, 1000);
		}).catch(function (error) {
			signedIn = false;
			document.getElementById('btn_login').innerHTML = '<i class="material-icons left" style = "margin-top: -0.6em !important;" > exit_to_app</i > Login';
			console.log(error);
		});
	}
	else {
		firebase.auth().signOut().then(function () {
			signedIn = false;
			document.getElementById('btn_login').innerHTML = '<i class="material-icons left" style = "margin-top: -0.6em !important;">exit_to_app</i> Login';
			$("#screen_intro").fadeOut(500);
			$("#screen_database").fadeOut(500);
			$("#screen_new_map").fadeOut(500);
			setTimeout(function () { $("#screen_login").fadeIn(500); }, 600);
		}).catch(function (error) {
			console.log(error);
		});
	}

}

/* Introduce users to the user interface */
function introduceUI() {

}

/* Get date string from timestamp */
function generateDateString(date) {
	date = date.toDate();
	return month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}


/* Get time string from timestamp */
function generateTimeString(date) {
	date = date.toDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	return hours + ':' + minutes + ':00';
}


/* Function to read a link */
function readLink(link) {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", link, true);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0) {
				link_data = rawFile.responseText;
			}
		}
	}
	rawFile.send(null);
}

/* Map load function */
function loadMap(geojson_link) {
	if (!map.getLayer('ipr-start')) {
		map.addLayer({
			'id': 'ipr-start',
			'type': 'symbol',
			'source': {
				'type': 'geojson',
				'data': geojson_link
			},
			'layout': {
				'icon-image': 'marker-icon',
				'text-field': 'locality'
			}
		});
	}
	if (!map.getLayer('ipr-track')) {
		map.addLayer({
			'id': 'ipr-track',
			'type': 'line',
			'source': {
				'type': 'geojson',
				'data': geojson_link
			},
			'paint': {
				'line-color': '#0000AA',
				'line-width': 4
			}
		});
	}
}

/* Action button listeners */
function handleAction(action, docId) {
	switch (action) {
		case "view_map":
			db.collection('locations').doc(docId).get().then(doc => {
				document.getElementById('modal_view_map_name').innerHTML = doc.data().map_name;
				M.Modal.getInstance(modal_view_map).open();
				setTimeout(function () {
					readLink('https://api.mapbox.com/geocoding/v5/mapbox.places/' + doc.data().map_name + ',%20' + doc.data().location + '.json?access_token=pk.eyJ1Ijoic2lkZGhhbnR2aW5jaHVya2FyIiwiYSI6ImNqbGprZTIxdTBic2wzcG5kbnFnZDZnOTAifQ.ztgcGv9lZMeV61VvGKMHIw');
					setTimeout(function () {
						/* Initialize Mapbox */
						mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkZGhhbnR2aW5jaHVya2FyIiwiYSI6ImNqbGprZTIxdTBic2wzcG5kbnFnZDZnOTAifQ.ztgcGv9lZMeV61VvGKMHIw';
						map = new mapboxgl.Map({
							container: 'location_map',
							style: 'mapbox://styles/mapbox/streets-v11',
							zoom: 14,
							center: JSON.parse(link_data).features[0].center
						});
						setTimeout(function () {
							map.loadImage('resources/images/icons/start_flag.png', function (error, image) {
								if (error) console.log(error);
								map.addImage('marker-icon', image);
								setTimeout(function () { loadMap(doc.data().geojson_link); }, 1000);
							});
						}, 1000);
					}, 1000);

				}, 1000)
			});
			break;
		case "approve_map":
			db.collection('locations').doc(docId).update({ status: true, approved_by: user.displayName });
			break;
		case "disapprove_map":
			db.collection('locations').doc(docId).update({ status: false });
			break;
		case "delete_map":
			db.collection('locations').doc(docId).delete();
			break;
		default:
			console.log('Unrecognized map entry action: \'' + action + '\'');
			break;
	}
}

/* Map entry row cleaning function */
function cleanUpMapEntryTable() {
	document.getElementById('screen_database_rows').innerHTML = '';
}

/* Map entry row builder function */
function buildMapEntryRow(docId, sno, mno, mn, loc, cd, statusBool, timestamp, approved_by) {
	var status = null;
	if (statusBool) {
		status = '<span style="color:#004400;">Map approved by ' + approved_by + '</span>';
	}
	else status = '<span style="color:#440000;">Pending</span>';
	var actions = '<a rel="noreferrer" onclick="handleAction(\'view_map\',\'' + docId + '\');" class="btn-floating waves-effect waves-light blue darken-3 tooltipped z-depth-2" data-tooltip="View this map" data-position="bottom"><i class="material-icons">info</i></a>&emsp;<a rel="noreferrer" onclick="handleAction(\'approve_map\',\'' + docId + '\');" class="btn-floating waves-effect waves-light green darken-3 tooltipped z-depth-2" data-tooltip="Approve this map" data-position="bottom"><i class="material-icons">check</i></a>&emsp;<a rel="noreferrer" onclick="handleAction(\'disapprove_map\',\'' + docId + '\');" class="btn-floating waves-effect waves-light orange darken-3 tooltipped z-depth-2" data-tooltip="Disapprove this map" data-position="bottom"><i class="material-icons">undo</i></a>&emsp;<a rel="noreferrer" onclick="handleAction(\'delete_map\',\'' + docId + '\');" class="btn-floating waves-effect waves-light red darken-3 tooltipped z-depth-2" data-tooltip="Delete this map" data-position="bottom"><i class="material-icons">close</i></a>';
	document.getElementById('screen_database_rows').innerHTML += '<tr><td style="width: 25px;">' + sno + '</td><td><a href="https://github.com/siddhantvinchurkar/mapbase-dataset/blob/master/' + mno.substring(0, mno.lastIndexOf('-')) + '/' + mno + '.json" target="_blank" rel="noreferrer"><b>' + mno + '</b></a></td><td>' + mn + '</td><td><a href="https://github.com/siddhantvinchurkar/mapbase-dataset/blob/master/' + mno.substring(0, mno.lastIndexOf('-')) + '/All.json" target="_blank" rel="noreferrer"><b>' + loc + '</b></a></td><td>' + cd + ' Kilometers</td><td>' + status + '</td><td>' + generateColorCodedDateString(timestamp, '#004400', '#000044', true, true) + '</td><td>' + actions + '</td></tr>';
}

/* Handle Real Time Updates */
function handleRealTimeUpdates() {
	db.collection('locations').doc('counters').onSnapshot(doc => {
		document.getElementById('approved_maps_count').innerHTML = doc.data().approved;
		document.getElementById('pending_maps_count').innerHTML = doc.data().pending;
		document.getElementById('total_maps_count').innerHTML = doc.data().total;
		// Reinitialize UI
		initializeUI();
	});
	if (filters) {
		if (filter_circuit_distance) {
			orderBy = 'circuit_distance';
			sortBy = document.getElementById('filter_circuit_distance_select').options[document.getElementById('filter_circuit_distance_select').options.selectedIndex].value;
		}
		if (filter_timestamp) {
			orderBy = 'timestamp';
			sortBy = document.getElementById('filter_timestamp_select').options[document.getElementById('filter_timestamp_select').options.selectedIndex].value;
		}
		if (filter_map_number === '' && filter_map_name != '' && filter_location != '') {
			unsubscribe = db.collection('locations').where('map_name', '==', filter_map_name).where('location', '==', filter_location).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;

				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else if (filter_map_name === '' && filter_map_number != '' && filter_location != '') {
			unsubscribe = db.collection('locations').where('map_number', '==', filter_map_number).where('location', '==', filter_location).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else if (filter_location === '' && filter_map_number != '' && filter_map_name != '') {
			unsubscribe = db.collection('locations').where('map_number', '==', filter_map_number).where('map_name', '==', filter_map_name).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else if (filter_map_number === '' && filter_map_name === '' && filter_location != '') {
			unsubscribe = db.collection('locations').where('location', '==', filter_location).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else if (filter_map_number === '' && filter_location === '' && filter_map_name != '') {
			unsubscribe = db.collection('locations').where('map_name', '==', filter_map_name).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else if (filter_map_name === '' && filter_location === '' && filter_map_number != '') {
			unsubscribe = db.collection('locations').where('map_number', '==', filter_map_number).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else if (filter_map_number === '' && filter_map_name === '' && filter_location === '') {
			unsubscribe = db.collection('locations').orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
		else {
			unsubscribe = db.collection('locations').where('map_number', '==', filter_map_number).where('map_name', '==', filter_map_name).where('location', '==', filter_location).orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
				cleanUpMapEntryTable();
				var sno = 0;
				/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
				current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
				querySnapshot.forEach(doc => {
					current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
					/*

					// This code has been deprecated in favour of a better method.
					if (doc.data().status) approved_count++; else pending_count++;
	
					*/
					sno++;
					if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
						if (doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
						if (!doc.data().status) {
							buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
						}
					}
					else {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				});
				/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
				// Reinitialize UI
				initializeUI();
			});
		}
	}
	else {
		if (filter_circuit_distance) {
			orderBy = 'circuit_distance';
			sortBy = document.getElementById('filter_circuit_distance_select').options[document.getElementById('filter_circuit_distance_select').options.selectedIndex].value;
		}
		if (filter_timestamp) {
			orderBy = 'timestamp';
			sortBy = document.getElementById('filter_timestamp_select').options[document.getElementById('filter_timestamp_select').options.selectedIndex].value;
		}
		unsubscribe = db.collection('locations').orderBy(orderBy, sortBy).limit(lmt).onSnapshot(querySnapshot => {
			cleanUpMapEntryTable();
			var sno = 0;
			/*

				// This code has been deprecated in favour of a better method.
				var approved_count = 0;
				var pending_count = 0;
	
				*/
			current_csv = '#,Map Number,Map Name,Location,Circuit Distance,Status,Date Created';
			querySnapshot.forEach(doc => {
				current_csv += '\n"' + sno + '","' + doc.data().map_number + '","' + doc.data().map_name + '","' + doc.data().location + '","' + doc.data().circuit_distance + ' Kilometers","' + doc.data().status + '","' + generateDateString(doc.data().timestamp) + ' at ' + generateTimeString(doc.data().timestamp) + '"';
				/*

				// This code has been deprecated in favour of a better method.
				if (doc.data().status) approved_count++; else pending_count++;
	
				*/
				sno++;
				if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'approved') {
					if (doc.data().status) {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				}
				else if (filter_status && document.getElementById('filter_status_select').options[document.getElementById('filter_status_select').options.selectedIndex].value === 'pending') {
					if (!doc.data().status) {
						buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
					}
				}
				else {
					buildMapEntryRow(doc.id, sno, doc.data().map_number, doc.data().map_name, doc.data().location, doc.data().circuit_distance, doc.data().status, doc.data().timestamp, doc.data().approved_by);
				}
			});
			/*

				// This code has been deprecated in favour of a better method.

				document.getElementById('approved_maps_count').innerHTML = approved_count;
				document.getElementById('pending_maps_count').innerHTML = pending_count;
				document.getElementById('total_maps_count').innerHTML = sno;
				*/
			// Reinitialize UI
			initializeUI();
		});
	}
}

/* Change row limit function */
function changeRowLimit(lt) {
	lmt += lt;
	unsubscribe();
	handleRealTimeUpdates();
}

/* Prepare geojson function */
function prepareGeojsonFilesForUpload(fileList) {
	return new Promise(function (resolve) {
		var firestoreObjectList = [];
		var map_serial = 0;
		var map_code = null;
		var map_number = [];
		var map_name = [];
		var map_city = null;
		var map_state = null;
		var map_location = [];
		var map_status = false;
		var map_distance = [];
		var map_timestamp = new Date();
		fileIndex = 1;
		for (i = 0; i < fileList.length; i++) {
			// 1. Read geojson file
			var fileReader = new FileReader();
			fileReader.onload = function (data) {
				data = JSON.parse(data.target.result);
				for (j = 0; j < data.features.length; j++) {
					// 2. Fetch location details
					if (data.features[j].geometry.type == "Point") {
						$.getJSON('https://api.mapbox.com/geocoding/v5/mapbox.places/' + data.features[j].geometry.coordinates[0] + ',' + data.features[j].geometry.coordinates[1] + '.json?access_token=pk.eyJ1Ijoic2lkZGhhbnR2aW5jaHVya2FyIiwiYSI6ImNqbGprZTIxdTBic2wzcG5kbnFnZDZnOTAifQ.ztgcGv9lZMeV61VvGKMHIw', function (data1) {
							for (k = 0; k < data1.features[0].context.length; k++) {
								if (data1.features[0].context[k].id.includes('place')) map_city = data1.features[0].context[k].text;
								if (data1.features[0].context[k].id.includes('region')) map_state = data1.features[0].context[k].text;
								if (map_city !== null && map_state !== null) map_location.push(map_city + ', ' + map_state);
								if (map_city !== null && map_state !== null) map_name.push(data1.features[0].text);
								if (map_city !== null && map_state !== null) {
									for (n = 0; n < data.features.length; n++) {
										if (data.features[n].geometry.type == 'LineString') {
											map_distance.push(parseFloat(turf.length(turf.lineString(data.features[n].geometry.coordinates), { units: 'kilometers' }).toFixed(2), 10));
											break;
										}
									}

								}
								if (map_city !== null && map_state !== null) break;
							}
							// 3. Determine location code
							$.getJSON('resources/scripts/ipr_cities.json', function (data2) {
								for (l = 0; l < data2.ipr_cities.length; l++) {
									if (data2.ipr_cities[l].city_name == map_city) {
										map_code = data2.ipr_cities[l].city_code;
										break;
									}
								}
								// 4. Fetch map serial number
								db.collection('locations').where('location', '==', map_location[fileIndex]).orderBy('timestamp', 'desc').get().then((querySnapshot) => {
									map_serial = 1;
									querySnapshot.forEach((doc) => {
										map_serial++;
									});
									// 5. Generate map number
									map_number.push('IPR-MAP-' + map_code + '-' + (map_serial + fileIndex));
									// 6. Create List of firestore database compatible objects
									if (fileIndex == fileList.length) {
										for (m = 0; m < fileList.length; m++) {
											firestoreObjectList.push({
												map_number: fileList[m].name.substring(0, fileList[m].name.length - 5),
												map_name: map_name[m],
												location: map_location[m],
												circuit_distance: map_distance[m],
												status: false,
												timestamp: new Date(),
												geojson_link: "https://loremimpsumdolorsitamet/",
												approved_by: "a human"
											});
										}
										resolve(firestoreObjectList);
									}
									fileIndex++;
								});
							});

						});
						break;
					}
				}
			}
			fileReader.readAsText(fileList[i]);
		}
	});
}

/* Upload file function */
function uploadFile(file, name) {
	globalIndex++;
	uploadTask.push(storage.child('ipr_locations/' + name).put(file, { contentType: 'application/json' }));
	uploadTask[globalIndex - 1].on('state_changed',
		function progress(snapshot) {
			console.log('Uploading ' + name + '...');
		},
		function error(error) {
			console.log('Error uploading ' + name + '...\n\n' + error);
			document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Upload failed!';
			return false;
		},
		function complete() {
			storage.child('ipr_locations/' + name).getDownloadURL().then(function (downloadURL) {
				downloadURLList.push(downloadURL);
				console.log('Uploaded ' + name + '...');
				return true;
			});
		}
	);
}

/* Upload geojson function */
function uploadGeoJson(fileList) {
	return new Promise(function (resolve, reject) {
		prepareGeojsonFilesForUpload(fileList).then((data) => {
			document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Uploading geojson files...';
			globalIndex = 0;
			for (i = 0; i < fileList.length; i++) {
				var filey = fileList;
				var datay = data;
				// Upload files sequentially
				db.collection('locations').add(data[i]).then(function (doc) {
					if (uploadFile(filey[globalIndex], filey[globalIndex].name)) {
						// Wait for file to upload
						setTimeout(function () {
							// Store metadata on firestore
						}, ((globalIndex == 0 ? 1 : globalIndex) * 5000));
					}
					else {
						if (globalIndex === filey.length - 1) reject(false);
					}
					if (globalIndex === filey.length - 1) resolve(true);
				});
			}
		});
	});
}

/* Escape regular expression function */
function escapeRegExp(str) {
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/* String replaceAll() function */
function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function downloadCsv() {
	current_csv = replaceAll(current_csv, 'true', 'Approved');
	current_csv = replaceAll(current_csv, 'false', 'Pending');
	var blob = new Blob([current_csv], { type: 'text/csv' });
	var a = document.createElement('a');
	a.download = new Date() + '.csv';
	a.href = URL.createObjectURL(blob);
	a.dataset.downloadurl = ['text/csv', a.download, a.href].join(':');
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}

window.onload = function () {

	/* Configure AJAX requests */
	jQuery.ajaxPrefilter(function (options) {
		if (options.crossDomain && jQuery.support.cors) {
			options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
		}
	});

	// Register a Service Worker
	if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }

	/* Initialize Firebase */
	firebase.initializeApp({
		apiKey: "AIzaSyCKv-Jbc_nPypliESv6idNqoAgpxZfyBIs",
		authDomain: "india-plog-run.firebaseapp.com",
		databaseURL: "https://india-plog-run.firebaseio.com",
		projectId: "india-plog-run",
		storageBucket: "india-plog-run.appspot.com",
		messagingSenderId: "500742941747",
		appId: "1:500742941747:web:e8949f6f2781165c"
	});

	/* Set the language */
	firebase.auth().languageCode = 'en';

	/* Initialize Firestore */
	db = firebase.firestore();

	/* Initialize Storage */
	storage = firebase.storage().ref();

	/* Establish autocomplete listeners */
	db.collection('locations').orderBy('timestamp', 'desc').onSnapshot(querySnapshot => {
		autoCompleteList = {};
		querySnapshot.forEach(doc => {
			autoCompleteList[doc.data().map_number] = null;
			autoCompleteList[doc.data().map_name] = null;
			autoCompleteList[doc.data().location] = null;
		});
		// Initialize user interface
		initializeUI();
	});

	/* Establish click listeners */
	document.getElementById('btn_login').onclick = function () {
		signIn();
	}
	document.getElementById('btn_google').onclick = function () { document.getElementById('btn_login').click(); }
	document.getElementById('btn_begin').onclick = function () {
		// introduceUI();
		$("#screen_intro").fadeOut(500);
		setTimeout(function () { $("#screen_database").fadeIn(500); }, 600);
	}
	document.getElementById('btn_apply_filters').onclick = function () {
		filters = true; unsubscribe(); handleRealTimeUpdates();
	}
	document.getElementById('btn_add_map').onclick = function () {
		$("#screen_database").fadeOut(500);
		setTimeout(function () { $("#screen_new_map").fadeIn(500); }, 600);
	}
	document.getElementById('btn_add_map_back').onclick = function () {
		document.getElementById('btn_upload_geojson').classList.remove('disabled');
		document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Upload geojson';
		$("#add_map_step_2").fadeOut(250);
		$("#screen_new_map").fadeOut(500);
		setTimeout(function () { $("#screen_database").fadeIn(500); }, 600);
	}
	document.getElementById('btn_upload_geojson').onclick = function () {
		// Choose and upload geojson file
		document.getElementById('geojson_file').click();
	}
	document.getElementById('btn_print').onclick = function () {
		downloadCsv();
	}
	document.getElementById('btn_minus_25').onclick = function () {
		if (lmt > 25) changeRowLimit(-25);
		else lmt = 25;
	}
	document.getElementById('btn_plus_25').onclick = function () {
		changeRowLimit(25);
	}

	/* Establish input listeners */
	setInterval(function () { filter_map_number = document.getElementById('filter_map_number').value; }, 100);
	setInterval(function () { filter_map_name = document.getElementById('filter_map_name').value; }, 100);
	setInterval(function () { filter_location = document.getElementById('filter_location').value; }, 100);
	document.getElementById('filter_circuit_distance').onclick = function () {
		if (!document.getElementById('filter_circuit_distance').checked) {
			document.getElementById('filter_circuit_distance_select').disabled = true;
			document.getElementById('filter_timestamp_select').disabled = false;
		}
		else {
			document.getElementById('filter_circuit_distance_select').disabled = false;
			document.getElementById('filter_timestamp_select').disabled = true;
		}
		initializeUI();
		document.getElementById('filter_timestamp').checked = !document.getElementById('filter_circuit_distance').checked;
		filter_circuit_distance = document.getElementById('filter_circuit_distance').checked;
		filter_timestamp = document.getElementById('filter_timestamp').checked;
	}
	document.getElementById('filter_status').onclick = function () {
		if (!document.getElementById('filter_status').checked) {
			document.getElementById('filter_status_select').disabled = true;
		}
		else {
			document.getElementById('filter_status_select').disabled = false;
		}
		initializeUI();
		filter_status = document.getElementById('filter_status').checked;
	}
	document.getElementById('filter_timestamp').onclick = function () {
		if (!document.getElementById('filter_timestamp').checked) {
			document.getElementById('filter_circuit_distance_select').disabled = false;
			document.getElementById('filter_timestamp_select').disabled = true;
		}
		else {
			document.getElementById('filter_circuit_distance_select').disabled = true;
			document.getElementById('filter_timestamp_select').disabled = false;
		}
		initializeUI();
		document.getElementById('filter_circuit_distance').checked = !document.getElementById('filter_timestamp').checked;
		filter_timestamp = document.getElementById('filter_timestamp').checked;
		filter_circuit_distance = document.getElementById('filter_circuit_distance').checked;
	}
	document.getElementById('geojson_file').onchange = function () {
		document.getElementById('btn_upload_geojson').classList.add('disabled');
		document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Preparing geojson files...';
		current_files = document.getElementById('geojson_file').files;
		if (current_files.length > 0) uploadGeoJson(current_files).then(function (status) {
			document.getElementById('screen_new_map_number').innerHTML = current_files.length;
			$("#add_map_step_2").fadeIn(500);
			document.getElementById('btn_upload_geojson').classList.remove('disabled');
			document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Upload geojson files';
		}, function (status) {
			//document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Upload failed! You\'re a failure!';
			document.getElementById('btn_upload_geojson').classList.remove('disabled');
			document.getElementById('btn_upload_geojson').innerHTML = '<i class="material-icons left">cloud_upload</i>Upload geojson files';
		});
	}

	/* Establish key listeners */
	window.onkeydown = function (data) {
		if (data.keyCode == 13) {
			setTimeout(function () { document.getElementById('btn_apply_filters').click(); }, 210);
		}
	}

	/* Establish data change listeners */
	handleRealTimeUpdates();
}
