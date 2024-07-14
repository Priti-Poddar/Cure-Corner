
// document.querySelector("#share").addEventListener("click", () => {
//   findMyCoordinates();
// });
// // Check if geolocation is supported by the browser
// function findMyCoordinates() {
// //   document.addEventListener("DOMContentLoaded", () => {
//     mapboxgl.accessToken =
//       "pk.eyJ1IjoicHJpdGkwMCIsImEiOiJjbHkxN25qaG0wdTBsMmlwd25jZTY2bHc2In0.Nr_2r1NZvA6_sW1oUJd_sw";

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//             console.log(latitude, longitude);
//             const map = new mapboxgl.Map({
//               container: "map",
//               style: "mapbox://styles/mapbox/streets-v11",
//               center: [longitude, latitude],
//               zoom: 9,
//             });

//             new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

//               (async () => {
//                   const response = await fetch("/reverse-geocode", {
//                       method: "POST",
//                       headers: {
//                           "Content-Type": "application/json",
//                       },
//                       body: JSON.stringify({ longitude, latitude }),
//                   });
//                   const content = await response.json();
//                   console.log(content);
//               })();
//             // .then((response) => response.json())
//             // .then((data) => {
//             //   console.log(data);
//             // });
//         },
//         () => {
//           console.log("Unable to retrieve your location");
//         }
//       );
//     } else {
//       console.log("Geolocation is not supported by your browser");
//     }
// };



// // app.get(function getLoct(lat, lng){
// //     let response = geocodingClient
// //       .reverseGeocode({
// //         query: [lng, lat],
// //       })
// //       .send();
// //     console.log(response.body);
// // })

// // function getLoct(mapAPI) {
// //     request({ url: mapAPI, json: true }, function (error, response) {
// //       if (error) {
// //         console.log("Unable to connect to Geocode API");
// //       } else if (response.body.features.length == 0) {
// //         console.log(
// //           "Unable to find location. Try to" + " search another location."
// //         );
// //       } else {
// //         console.log(response.body.features[0].place_name);
// //       }
// //     });
// // }

