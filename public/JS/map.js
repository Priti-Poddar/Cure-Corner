mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  center: userAdd.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 8, // starting zoom
});

const marker1 = new mapboxgl.Marker({ color: "red" })
  .setLngLat(geo) //listing.geometry.coordinate
  .setPopup(
    new mapboxgl.Popup({ offset: 20 }).setHTML(
      `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`
    )
  )
  .addTo(map);

  