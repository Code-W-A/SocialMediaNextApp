import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import strings from "../i18n/strings";

// Check App Platform
const checkPlatform = () => {
  if (Platform.OS === "android") {
    return "android";
  } else {
    return "ios";
  }
};

// Device Type
const getDeviceType = () => {
  if (checkPlatform() === "ios") {
    return 2;
  } else {
    return 1;
  }
};

// Set Async Storage Data
const setAsyncStorageData = async (key, value) => {
  const stringData = JSON.stringify(value);
  await AsyncStorage.setItem(key, stringData);
};

// Get Async Storage Data
const getAsyncStorageData = async (key) => {
  const data = await AsyncStorage.getItem(key);
  return JSON.parse(data);
};

// Remove Async Storage Data
const removeAsyncStorageData = async (key) => {
  await AsyncStorage.removeItem(key);
};

// Debounce
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const showPopupWithOk = (title, message, okClicked) => {
  Alert.alert(title ? title : strings.cocast, message ? message : "", [
    { text: strings.ok.toUpperCase(), onPress: () => okClicked && okClicked() },
  ]);
};

//Show Popup with ok and cancel
const showPopupWithOkAndCancel = (title, message, okClicked, cancelClicked) => {
  Alert.alert(title ? title : strings.cocast, message ? message : "", [
    {
      text: strings.cancel,
      onPress: () => cancelClicked && cancelClicked(),
      style: "cancel",
    },
    {
      text: strings.ok,
      onPress: () => okClicked && okClicked(),
    },
  ]);
};

const secondsToMilliseconds = (seconds) => {
  return seconds * 1000;
};

export {
  getAsyncStorageData,
  setAsyncStorageData,
  removeAsyncStorageData,
  getDeviceType,
  checkPlatform,
  debounce,
  showPopupWithOk,
  showPopupWithOkAndCancel,
  secondsToMilliseconds,
};
