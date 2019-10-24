navigator.geolocation.getCurrentPosition(
    position => {
      const tackPhotoLatitude = position.coords.latitude;
      const tackPhotoLongitude = position.coords.longitude;

      this.setState({
        tackPhotoLatitude: position.coords.latitude,
        tackPhotoLongitude: position.coords.longitude,
      });
      console.log(tackPhotoLatitude, tackPhotoLongitude);
      let getAreaUrl = `https://maps.google.com/maps/api/geocode/json?latlng=`+tackPhotoLatitude+`,`+tackPhotoLongitude+`&language=zh-TW&sensor=true&key=AIzaSyA6aaKBA92hNkTGwdJGEs1QAIbjGoixmQI`

      let test1 = fetch(getAreaUrl, {
        method: "GET",
      })
      console.log(getAreaUrl)
      console.log(test1)
      const respJson1 = test1.json();
      console.log(respJson1)

    },
    error => console.log("Error:", error),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  );