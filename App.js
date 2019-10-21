import React, { Component } from "react";
import { Platform, Text, View, StyleSheet, Dimensions,Image } from "react-native";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import Polyline from "@mapbox/polyline";

const locations = require("./locations.json");
const { width, height } = Dimensions.get('screen')

export default class App extends Component {
  state = {
    latitude: null,
    longitude: null,
    locations: locations,
  };

  async componentDidMount() {
    //官方寫法 start
    const { status } = await Permissions.getAsync(Permissions.LOCATION);

    if (status !== "granted") {
      const response = await Permissions.askAsync(Permissions.LOCATION);
    }
    // let location = await Location.getCurrentPositionAsync({});
    // this.setState({ location });
    //end

    // getCurrentPositionAsync 格式
    // {"timestamp":1571582585771,"mocked":false,"coords":{"altitude":28.399999618530273,"heading":0,"longitude":121.5378173,"speed":0,"latitude":25.0057082,"accuracy":17.600000381469727}}

    //指派 latitude, longitude
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) =>
        this.setState({ latitude, longitude }, this.mergeCoords),
      error => console.log("Error:", error)
    );

    const {
      locations: [sampleLocation],
    } = this.state;

    this.setState(
      {
        desLatitude: sampleLocation.coords.latitude,
        desLongitude: sampleLocation.coords.longitude,
      },
      this.mergeCoords
    );
  }

  //從 location.json 取得經緯度
  mergeCoords = () => {
    const { latitude, longitude, desLatitude, desLongitude } = this.state;

    const hasStartAndEnd = latitude !== null && desLatitude !== null;

    if (hasStartAndEnd) {
      const concatStart = `${latitude},${longitude}`;
      const concatEnd = `${desLatitude},${desLongitude}`;
      this.getDirections(concatStart, concatEnd);
      console.log(concatStart + " " + concatEnd);
    }
  };

  async getDirections(startLoc, desLoc) {
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=AIzaSyA6aaKBA92hNkTGwdJGEs1QAIbjGoixmQI`
      );
      // console.log(resp)
      const respJson = await resp.json();
      // console.log(respJson)
      // const response = respJson.routes[0];
      // const distanceTime = response.legs[0];
      // const distance = distanceTime.distance.text;
      // const time = distanceTime.duration.text;
      const points = Polyline.decode(
        respJson.routes[0].overview_polyline.points
      );
      // console.log(points)
      const coords = points.map(point => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });
      // console.log(coords)
      this.setState({ coords });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async onTargetPress () {
    console.log("testtetetset")
  }

  onMarkerPress = location => () => {
    const {
      coords: { latitude, longitude },
    } = location;
    this.setState(
      {
        destination: location,
        desLatitude: latitude,
        desLongitude: longitude,
      },
      this.mergeCoords
    );
  };

  //地點標記
  renderMarkers = () => {
    const { locations } = this.state;
    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;
          return (
            <Marker
              key={idx}
              coordinate={{ latitude, longitude }}
              onPress={this.onMarkerPress(location)}
            >
              <Image source={{uri:"https://p1.hiclipart.com/preview/180/349/86/super-mario-icons-super-mario-star-illustration-thumbnail.jpg"}} style={{height: 35, width:35 }} />
            </Marker>
          );
        })}
      </View>
    );
  };

  render() {
    const { latitude, longitude, coords, destination } = this.state;

    if (latitude) {
      return (
        <MapView
          showsUserLocation
          style={styles.mapStyle}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {this.renderMarkers()}

          <Text> 取得定位中 </Text>
          <Image
            source={{ uri: destination && destination.image_url }}
            style={{
              flex: 1,
              width: width * 0.95,    //螢幕寬
              alignSelf: "center",
              height: height * 0.20,  //螢幕高
              position: "absolute",
              bottom: height * 0.05,
            }}
            onPress={this.onTargetPress()}
          />
        </MapView>
      );
    }
    return (
      <View style={styles.container}>
        <Text> 取得定位中 </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center",
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
