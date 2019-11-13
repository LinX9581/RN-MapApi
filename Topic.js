import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Dialog } from "react-native-simple-dialogs";

class Dialogpage extends React.Component {
  state = {
    answerTipsDialogVisible: false,
  };

  anwser = () => {
    this.setState({ answerTipsDialogVisible: true });
  };
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[naviStyle.button, { backgroundColor: "#A58987" }]}
        >
          <Text onPress={this.anwser} style={naviStyle.buttonText}>
            達題解成就
          </Text>
        </TouchableOpacity>

        <Dialog
          visible={this.state.answerTipsDialogVisible}
          title="Custom Dialog"
          onTouchOutside={() =>
            this.setState({ answerTipsDialogVisible: false })
          }
        >
          <View>
            <Text>達題解成就!!</Text>
          </View>
        </Dialog>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    color: "#ffffff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0)",
  },
  desc: {
    fontSize: 20,
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0)",
    textAlign: "center",
  },
});
export default Dialogpage;
