import React, { Component } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Dialog from "react-native-dialog";
 
export default class Topic extends Component {
 
  render() {
    return (
        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>Account delete</Dialog.Title>
          <Dialog.Description>
            Do you want to delete this account? You cannot undo this action.
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
          <Dialog.Button label="Delete" onPress={this.handleDelete} />
        </Dialog.Container>
    );
  }
}