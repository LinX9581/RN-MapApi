import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Dialog } from "react-native-simple-dialogs";

import * as Location from "expo-location";
import MapView, { Callout } from "react-native-maps";
import { Marker } from "react-native-maps";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import {
  Container,
  Header,
  Button,
  Icon,
  Fab,
  View,
  Footer,
  FooterTab,
} from "native-base";

let num = 0;
const locations = require("./location/locations.json");
const { width, height } = Dimensions.get("screen");

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      locations: locations,
      destination: {},
      serverUserAddressInfo: [
        0,
        1,
        1,

        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        0,
        0,
        0,

        0,
        0,
        1,
        0,
        1,
        0,
        0,
        1,
        0,
        0,

        0,
        0,
        0,
        1,
        1,
        0,
        1,
        0,
        1,
        1,
      ],
      nightMarketVisible: false,
      michelinVisible: false,
      hotSightseeing: false,
      test: true,
      active: false,
    };
  }

  async componentDidMount() {
    //官方寫法 start
    // 現在的位置
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      console.log("please");
    }
    try {
      await Permissions.askAsync(Permissions.LOCATION);
      let location = await Location.getCurrentPositionAsync({});

      this.setState({
        longitude: location.coords.longitude, //經度(垂直)
        latitude: location.coords.latitude, //緯度(水平)
      });
    } catch {
      alert("您必須使用定位功能才能使用成就地圖");
    }
  }

  //地圖標記 start

  // openDialog = show => {
  //   this.setState({ showDialog: show });
  // };

  // optionYes = () => {
  //   this.openConfirm(false);
  //   // Yes, this is a workaround :(
  //   // Why? See this https://github.com/facebook/react-native/issues/10471
  //   setTimeout(() => {
  //     Alert.alert("The YES Button touched!");
  //   }, 300);
  // };

  // optionNo = () => {
  //   this.openConfirm(false);
  //   // Yes, this is a workaround :(
  //   // Why? See this https://github.com/facebook/react-native/issues/10471
  //   setTimeout(() => {
  //     Alert.alert("The NO Button touched!");
  //   }, 300);
  // };

  //#################################   底下兩個Button start  ######################################

  //拍照解成就
  _takePhoto = async () => {
    const { serverUserAddressInfo } = this.state; //server 傳遞訊息
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

      let pointAddress = [
        [24.988076, 121.547923], //管院
        [25.034768, 121.521797], //中正紀念堂
        [25.040347, 121.560254], //國父紀念館
        [24.998666, 121.581094], //木柵動物園
        [25.00481, 121.53804], //三角冰
        [25.00471, 121.538378], //咖啡廳
      ];

      for (let i = 0; i <= pointAddress.length - 1; i++) {
        const getCertainPointUrl =
          `https://maps.googleapis.com/maps/api/directions/json?origin=25.0056622,121.5378398&destination=` +
          pointAddress[i].toString() +
          `&key=AIzaSyA6aaKBA92hNkTGwdJGEs1QAIbjGoixmQI`; //目前位置到目標位置
        // console.log(getCertainPointUrl)
        const getCertainPoint = await fetch(getCertainPointUrl);
        const getCertainPointJson = await getCertainPoint.json();
        const getCertainPointJsonRoutes = getCertainPointJson.routes[0];
        const getCertainPointJsonRoutesTime = getCertainPointJsonRoutes.legs[0]; //位置資訊
        const getCertainPointJsonDistance =
          getCertainPointJsonRoutesTime.distance.value;
        if (getCertainPointJsonDistance < 300) {
          if (serverUserAddressInfo[i] == "1") {
            Alert.alert(
              "已重複完成成就哦!",
              "請前往下一個成就",
              [{ text: "Next", onPress: () => console.log("已重複") }],
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
        }
      }
    }
  };

  //################################################### 土法煉鋼的地標 Start ####################################

  hotSightseeing = () => {
    if (num % 2 == 0) {
      this.setState({
        hotSightseeing: false,
      });
    } else {
      this.setState({
        hotSightseeing: true,
      });
    }
    num++;
  };

  renderhotSightseeing = () => {
    const { locations } = this.state; //所有location
    const { serverUserAddressInfo } = this.state;
    console.log(serverUserAddressInfo + " 從Server 撈出的訊息");
    // console.log('location'+ JSON.stringify(locations))asxa
    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;

          if (location.label == "前十大熱門景點") {
            if (serverUserAddressInfo[idx] == "1") {
              return (
                <Marker
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)} //傳送這個座標的loaction
                >
                  <Image
                    source={require("./img/hotSightseeingFinished.png")}
                    style={[
                      this.state.hotSightseeing
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            } else {
              return (
                <Marker //定位
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)}
                >
                  <Image
                    source={require("./img/hotSightseeing.png")}
                    style={[
                      this.state.hotSightseeing == true
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            }
          }
        })}
      </View>
    );
  };

  michelin = () => {
    if (num % 2 == 0) {
      this.setState({
        michelinVisible: false,
      });
    } else {
      this.setState({
        michelinVisible: true,
      });
    }
    num++;
  };

  rendermichelin = () => {
    const { locations } = this.state; //所有location
    const { serverUserAddressInfo } = this.state;
    console.log(serverUserAddressInfo + " 從Server 撈出的訊息");
    // console.log('location'+ JSON.stringify(locations))
    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;

          if (location.label == "米其林") {
            if (serverUserAddressInfo[idx] == "1") {
              return (
                <Marker
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)} //傳送這個座標的loaction
                >
                  <Image
                    source={require("./img/michelinFinish.png")}
                    style={[
                      this.state.michelinVisible
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            } else {
              return (
                <Marker //定位
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)}
                >
                  <Image
                    source={require("./img/michelin.png")}
                    style={[
                      this.state.michelinVisible == true
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            }
          }
        })}
      </View>
    );
  };

  nightMarket = () => {
    if (num % 2 == 0) {
      this.setState({
        nightMarketVisible: false,
      });
    } else {
      this.setState({
        nightMarketVisible: true,
      });
    }
    num++;
  };

  renderNightMarket = () => {
    const { locations } = this.state; //所有location
    const { serverUserAddressInfo } = this.state;
    console.log(serverUserAddressInfo + " 從Server 撈出的訊息");
    // console.log('location'+ JSON.stringify(locations))
    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;

          if (location.label == "夜市") {
            if (serverUserAddressInfo[idx] == "1") {
              return (
                <Marker
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)} //傳送這個座標的loaction
                >
                  <Image
                    source={require("./img/night.jpg")}
                    style={[
                      this.state.nightMarketVisible
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            } else {
              return (
                <Marker //定位
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)}
                >
                  <Image
                    source={require("./img/nightMarketFinish.png")}
                    style={[
                      this.state.nightMarketVisible == true
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            }
          }
        })}
      </View>
    );
  };

  display = () => {
    if (num % 2 == 0) {
      this.setState({
        test: false,
      });
    } else {
      this.setState({
        test: true,
      });
    }
    num++;
  };

  //標記被按下
  onMarkerPress = location => () => {
    const {
      coords: { latitude, longitude },
    } = location;

    this.setState({
      destination: location,
      desLatitude: latitude,
      desLongitude: longitude,
    });
  };
  renderMarkers = () => {
    const { locations } = this.state; //所有location
    const { serverUserAddressInfo } = this.state;
    console.log(serverUserAddressInfo + " 從Server 撈出的訊息");
    // console.log('location'+ JSON.stringify(locations))
    return (
      <View>
        {locations.map((location, idx) => {
          const {
            coords: { latitude, longitude },
          } = location;

          if (location.label == "主線") {
            if (serverUserAddressInfo[idx] == "1") {
              console.log(location.name);
              return (
                <Marker
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)} //傳送這個座標的loaction
                  title={location.name}
                >
                  <Image
                    source={require("./img/finishMark.png")}
                    style={[
                      this.state.test
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            } else {
              return (
                <Marker //定位
                  key={idx}
                  coordinate={{ latitude, longitude }}
                  onPress={this.onMarkerPress(location)}
                  title={location.name}
                >
                  <Image
                    source={require("./img/mark.png")}
                    style={[
                      this.state.test == true
                        ? { height: 35, width: 35, display: "flex" }
                        : { height: 35, width: 35, display: "none" },
                    ]}
                  />
                </Marker>
              );
            }
          }
        })}
      </View>
    );
  };

  //################################################### 土法煉鋼的地標 End ####################################

  fab = async () => {
    console.log("asdasd");
    if (num % 2 == 0) {
      this.setState({
        fabActive: false,
      });
    } else {
      this.setState({
        fabActive: true,
      });
    }
    num++;
  };

  render() {
    const { latitude, longitude, destination } = this.state;

    if (latitude) {
      return (
        <View>
          {/* now */}

          <MapView
            showsUserLocation
            style={styles.mapStyle}
            initialRegion={{
              latitude: 25.062724,
              longitude: 121.511306,
              // latitude: this.state.latitude,
              // longitude: this.state.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {this.renderMarkers()}
            {this.renderNightMarket()}
            {this.rendermichelin()}
            {this.renderhotSightseeing()}
          </MapView>

          <Image
            source={{ uri: this.state.destination.image_url }}
            style={{
              flex: 1,
              margin: 10,
              width: width * 0.95, //螢幕寬
              alignSelf: "center",
              height: height * 0.2, //螢幕高ascas
              position: "absolute",
              bottom: Dimensions.get("window").height * 0.1,
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
              <Text style={naviStyle.buttonText}>如何解成就 </Text>
            </TouchableOpacity>
          </View>

          {/* <Dialog
            title="Custom Dialog"
            animationType="fade"
            contentStyle={{
              alignItems: "center",
              justifyContent: "center"
            }}
            onTouchOutside={() => this.openDialog(false)}
            visible={this.state.showDialog}
          >
            <Image
              source={{
                uri:
                  "https://facebook.github.io/react-native/img/header_logo.png"
              }}
              style={{
                width: 99,
                height: 87,
                backgroundColor: "black",
                marginTop: 10,
                resizeMode: "contain"
              }}
            />
            <Text style={{ marginVertical: 30 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <Button
              onPress={() => this.openDialog(false)}
              style={{ marginTop: 10 }}
              title="CLOSE"
            />
          </Dialog> */}

          <Footer>
            <FooterTab>
              <Button
                onPress={this.hotSightseeing}
                style={{ backgroundColor: "white" }}
              >
                <Image
                  source={require("./img/hotSightseeing.png")}
                  style={{ height: 35, width: 35, borderRadius: 100 / 2 }}
                />
              </Button>
              <Button
                onPress={this.michelin}
                style={{ backgroundColor: "white" }}
              >
                <Image
                  source={require("./img/michelin.png")}
                  style={{ height: 35, width: 35, borderRadius: 100 / 2 }}
                />
              </Button>
              <Button
                onPress={this.nightMarket}
                style={{ backgroundColor: "white" }}
              >
                <Image
                  source={require("./img/night.jpg")}
                  style={{ height: 35, width: 35, borderRadius: 100 / 2 }}
                />
              </Button>
              <Button
                onPress={this.display}
                style={{ backgroundColor: "white" }}
              >
                <Image
                  source={require("./img/mark.png")}
                  style={{ height: 35, width: 35, borderRadius: 100 / 2 }}
                />
              </Button>
            </FooterTab>
          </Footer>
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
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.9,
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
  button: {
    height: 40,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});
