import React from "react";
import { View } from "react-native"; // 1. Import View
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";

import colors from "../../config/colors";
import HomeScreen from "../screens/HomeScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import StatsScreen from "../screens/StatsScreen";
import AddScreen from "../screens/AddScreen";

interface MainTabNavigatorProps {
  user: User;
}

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ user }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.light,
        tabBarStyle: {
          height: 65,
          backgroundColor: colors.darkPrimary,
          borderTopWidth: 1,
          borderTopColor: colors.light,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-bar"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused, size }) => (
            <View
              style={{
                position: "absolute",
                top: -30,
                width: size * 2,
                height: size * 2,
                borderRadius: (size * 2.2) / 2,
                backgroundColor: focused ? colors.secondary : colors.light,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                color={focused ? colors.white : colors.primary}
                size={size * 1.5}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
