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
import Topic from "./Topic";

const locations = require("./locations.json");
const { width, height } = Dimensions.get("screen");

export default class App extends Component {
  state = {
    latitude: null,
    longitude: null,
    locations: locations,
    answerTipsDialogVisible: false,
    answerDialogVisible: false,
    tackPhotoLocation: null,
    tackPhotoLatitude: null,
    tackPhotoLongitude: null,
    // userAddressInfoState: [],
    serverUserAddressInfo: [0, 0, 1, 0, 1, 0],
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

  // 取得起始和目的經緯度 用google direction api 取得路徑資訊
  async getDirections(startLoc, desLoc) {
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=AIzaSyA6aaKBA92hNkTGwdJGEs1QAIbjGoixmQI`
      );
      const respJson = await resp.json();

      //需要取得距離資訊才用

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

  async onTargetPress() {
    console.log("testtetetset");
  }

  //地圖標記 start

  //標記被按下
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

  //#################################   底下兩個Button start  ######################################

  //拍照解成就
  _takePhoto = async () => {
    const { latitude, longitude } = this.state;
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

  //#################################   底下兩個Button end  #######################################

  //#################################   地圖標記 start  #######################################
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
          // console.log(idx)
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
        })}
      </View>
    );
  };

  //#################################   地圖標記 end  #######################################

  //dialog start
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

  //dialog end

  // MapView 不能放除了他自己以外的其他標籤
  render() {
    const { latitude, longitude, coords, destination } = this.state;

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
                達題解成就
              </Text>
            </TouchableOpacity>
          </View>

          <Dialog.Container visible={this.state.answerTipsDialogVisible}>
            <Dialog.Title>Account delete</Dialog.Title>
            <Dialog.Description>
              Do you want to delete this account? You cannot undo this action.
            </Dialog.Description>
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
