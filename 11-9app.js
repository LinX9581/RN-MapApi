import React, { Component } from "react";
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import Polyline from "@mapbox/polyline";
import Dialog from "react-native-dialog";
import * as ImagePicker from "expo-image-picker";

const locations = require("./location/locations.json");
const nightMarket = require("./location/nightMarket.json");

const { width, height } = Dimensions.get("screen");

export default class App extends Component {
  state = {
    isVisible: false,
    latitude: null,
    longitude: null,
    locations: locations,
    nightMarketLocations: nightMarket,
    answerTipsDialogVisible: false,
    answerDialogVisible: false,
    tackPhotoLocation: null,
    tackPhotoLatitude: null,
    tackPhotoLongitude: null,
    // userAddressInfoState: [],
    serverUserAddressInfo: [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    nightMarketTest: false,
  };

  //#################################   取得自己定位和目標地位 start  ######################################

  async componentDidMount() {
    //官方寫法 start
    const { status } = await Permissions.getAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      console.log('please')
    }
    try{
        await Permissions.askAsync(Permissions.LOCATION);
        let location = await Location.getCurrentPositionAsync({});
    
        this.setState({
          longitude: location.coords.longitude, //經度(垂直)
          latitude: location.coords.latitude //緯度(水平)
        })
     }
     catch{
        alert('您必須使用定位功能才能使用成就地圖')
     }
  }

  //拍照解成就
  _takePhoto = async () => {
    const { serverUserAddressInfo } = this.state;
    const { status: cameraPerm } = await Permissions.askAsync(
      Permissions.CAMERA
    );
    const { status: cameraRollPerm } = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === "granted" && cameraRollPerm === "granted") {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 9],
      });
      console.log(latitude + " " + longitude + " 自己的位置");

      let getAreaUrl =
        `https://maps.google.com/maps/api/geocode/json?latlng=` +
        latitude +
        `,` +
        longitude +
        `&language=zh-TW&sensor=true&key=AIzaSyA6aaKBA92hNkTGwdJGEs1QAIbjGoixmQI`;

      const getArea = await fetch(getAreaUrl);
      const getAreaJson = await getArea.json();
      let yourselfFormatAddress = getAreaJson.results[0].formatted_address;

      let pointAddress = [
        [24.988076, 121.547923], //管院
        [25.034768, 121.521797], //中正紀念堂
        [25.040347, 121.560254], //國父紀念館
        [24.998666, 121.581094], //木柵動物園
        [25.00481, 121.53804], //三角冰
        [25.00471, 121.538378], //咖啡廳
      ];

      let userAddressInfo = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i <= pointAddress.length - 1; i++) {
        const getCertainPointUrl =
          `https://maps.googleapis.com/maps/api/directions/json?origin=25.0056622,121.5378398&destination=` +
          pointAddress[i].toString() +
          `&key=AIzaSyA6aaKBA92hNkTGwdJGEs1QAIbjGoixmQI`;

        const getCertainPoint = await fetch(getCertainPointUrl);
        const getCertainPointJson = await getCertainPoint.json();
        const getCertainPointJsonRoutes = getCertainPointJson.routes[0];
        const getCertainPointJsonRoutesTime = getCertainPointJsonRoutes.legs[0];
        const getCertainPointJsonDistance =
          getCertainPointJsonRoutesTime.distance.value;

        console.log(getCertainPointJsonDistance);
        console.log(getCertainPointUrl);
        if (getCertainPointJsonDistance < 300) {
          if (serverUserAddressInfo[i] == "1") {
            Alert.alert(
              "已重複完成成就哦!",
              "請前往下一個成就",
              [{ text: "Next", onPress: () => console.log("已完成成就") }],
              { cancelable: false }
            );
          } else if (serverUserAddressInfo[5] == "1") {
            console.log("彩蛋區?");
          } else {
            console.log("第" + i + "個被完成");
            Alert.alert(
              "恭喜完成成就!",
              "請前往下一個成就",
              [{ text: "Next", onPress: () => console.log("已完成成就") }],
              { cancelable: false }
            );
            // server 預設的 addressInfo 要是 0,0,0,0,0...
            // 解開成就再 update serverAddressInfo
            serverUserAddressInfo[i] = 1;
            this.setState({ rerender: "test" });
          }
          // this.setState({ userAddressInfoState: userAddressInfo });
        }
        // console.log(pointAddress[0].toString())
      }
    }
    console.log(getAreaJson.results[0].formatted_address);
    console.log(pickerResult.uri);
    // this.setState({ image: pickerResult.uri });
    // ImgRecgnize(pickerResult.uri);
  };

  // 答題
  anwser = () => {
    this.setState({ answerTipsDialogVisible: true });
  };

  nightMarket = () => {
    this.setState({
      isVisible: !this.state.isVisible,
    });
  };

  //#################################   底下兩個Button end  #######################################

  //#################################   地圖標記 start  #######################################

  //標記被按下     每次按下去會重新render 所有圖標
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

  renderNightMarket = nightMarket => {
    console.log(nightMarket);
    const { locations } = this.state;
    const { serverUserAddressInfo } = this.state;
    if (nightMarket == "true") {
      return (
        <View>
          {locations.map((location, idx) => {
            const {
              coords: { latitude, longitude },
            } = location;

            //放陣列判斷 有沒有達成  各別render 圖片放不一樣
            if (location.label == "夜市") {
              if (serverUserAddressInfo[idx] == "1") {
                return (
                  <Marker
                    opacity="0"
                    // identifier="DestMarker"
                    key={idx}
                    coordinate={{ latitude, longitude }}
                    onPress={this.onMarkerPress(location)}
                  >
                    <Image
                      source={require("./img/night.jpg")}
                      style={{ height: 35, width: 35 }}
                    />
                  </Marker>
                );
              } else {
                return (
                  <Marker
                    key={idx}
                    coordinate={{ latitude, longitude }}
                    onPress={this.onMarkerPress(location)}
                  >
                    <Image
                      source={require("./img/night.jpg")}
                      style={{ height: 35, width: 35 }}
                    />
                  </Marker>
                );
              }
            }
          })}
        </View>
      );
    }
  };

  nightMarket = () => {
    const nightMarketTest = "true";
    console.log(nightMarketTest);
    this.setState({ nightMarketTest: "true" });
    this.renderNightMarket(nightMarketTest);
  };

  renderMarkers = () => {
    const { locations } = this.state;
    const { serverUserAddressInfo } = this.state;
    console.log(serverUserAddressInfo + " 從Server 撈出的訊息");

    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;

          //放陣列判斷 有沒有達成  各別render 圖片放不一樣
          if (location.label == "主線") {
            if (serverUserAddressInfo[idx] == "1") {
              return (
                <Marker
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)}
                >
                  <Image
                    source={require("./img/finishMark.png")}
                    style={{ height: 35, width: 35 }}
                  />
                </Marker>
              );
            } else {
              return (
                <Marker
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)}
                >
                  <Image
                    source={require("./img/mark.png")}
                    style={{ height: 35, width: 35 }}
                  />
                </Marker>
              );
            }
          }
        })}
      </View>
    );
  };

  //#################################   地圖標記 end  #######################################

  //#################################   Dialog Function start  #######################################

  showDialog = () => {
    this.setState({ answerTipsDialogVisible: true });
  };

  handleCancel = () => {
    this.setState({ answerTipsDialogVisible: false });
  };

  handleDelete = () => {
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic
    this.setState({ answerTipsDialogVisible: false });
  };

  //#################################   Dialog Function start  #######################################

  // MapView 不能放除了他自己以外的其他標籤
  render() {
    const { latitude, longitude, coords, destination } = this.state;

    const { nightMarketTest } = this.state;

    if (latitude) {
      return (
        <View>
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

            {this.renderNightMarket(nightMarketTest)}
          </MapView>

          <Image
            source={{ uri: destination && destination.image_url }}
            style={{
              flex: 1,
              margin: 10,
              width: width * 0.95, //螢幕寬
              alignSelf: "center",
              height: height * 0.2, //螢幕高
              position: "absolute",
              bottom: height * 0.05,
            }}
          ></Image>

          {
            //底下兩個button
          }
          <View style={naviStyle.bottmContainer}>
            <TouchableOpacity
              style={[naviStyle.button, { backgroundColor: "#53423D" }]}
            >
              <Text onPress={this._takePhoto} style={naviStyle.buttonText}>
                拍照解成就{" "}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[naviStyle.button, { backgroundColor: "#A58987" }]}
            >
              <Text onPress={this.anwser} style={naviStyle.buttonText}>
                答題解成就
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[naviStyle.button, { backgroundColor: "black" }]}
            >
              <Text onPress={this.nightMarket} style={naviStyle.buttonText}>
                夜市
              </Text>
            </TouchableOpacity>
          </View>

          {
            // 答題提示)
          }
          <Dialog.Container visible={this.state.answerTipsDialogVisible}>
            <Dialog.Title>提示</Dialog.Title>
            <Dialog.Description>只要完成區域成就</Dialog.Description>
            <Dialog.Button label="Cancel" onPress={this.handleCancel} />
            <Dialog.Button label="Delete" onPress={this.handleDelete} />
          </Dialog.Container>
        </View>
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

const naviStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottmContainer: {
    height: 60,
    flexDirection: "row",
  },
  background: {
    height: 800,
    width: 600,
    position: "absolute",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0)",
  },
  desc: {
    fontSize: 20,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0)",
    textAlign: "center",
  },
});
